// variables
let submitted = [];
let previouslySubmitted = [] ;
let notificationArray =[] ;
const baseURL = "http://localhost:8888/";


// Notification file
const notificationFile = `${baseURL}sound/notification.mp3`;
const alarmFile = `${baseURL}sound/alarm.wav`;


// Notification object
let sound = new Audio(notificationFile);
let alarmSound = new Audio(alarmFile);

function playSound(soundObj) {
    if (soundObj != null) {
        let startPlayPromise = soundObj.play();

        if (startPlayPromise !== undefined) {
            startPlayPromise.then(() => {
                // Start whatever you need to do only after playback has begun.
				console.log("Sound -> Notification");
            }).catch(error => {
                if (error.name === "NotAllowedError") {
                    console.log("Sound -> not allowed");
                } else {
                    // Handle a load or playback error
                    console.log("Sound -> error", error);
                }
            });
        }
    } else {
        console.log("**No File Found**");
    }
}


// DOM elements
const submittedContainer = document.querySelector('#submitted_orders');
const acceptedContainer = document.querySelector('#accepted_orders');
const dispatchedContainer = document.querySelector('#dispatched_orders');
const returnedContainer = document.querySelector('#returned_orders');
const notificationBox = document.querySelector("#notificationBox");
const notificationText = document.querySelector("#notification");
const closeButton = document.querySelector('#close');

const main = document.querySelector('.main');
const loader = document.querySelector('#loading');


// entryFunction -> Update Pharmacy status to Active
window.onload = function entryFunction() {
   
    fetch(`${baseURL}index.php/UpdateUserStatus/updateLocal/${storeName}/Active`)
        .catch(error => console.log(error));
    return null;
}


window.onbeforeunload = function exitFunction() {
   
    navigator.sendBeacon(`${baseURL}index.php/UpdateUserStatus/updateLocal/${storeName}/Inactive`);
    return null;
}

const emptyChildElements = function() {
    submittedContainer.innerHTML = '';
    acceptedContainer.innerHTML = '';
    dispatchedContainer.innerHTML = '';
    returnedContainer.innerHTML = '';

}
const dateConverter = function(date) {
    if (!date) return null;

    let dateParts = date.split("/");
    return new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);
}
// Function to add submitted box
const submittedBox = function(order) {
    let alertAnim;
    if (order.Submitted_on && (new Date().valueOf() - dateConverter(order.Submitted_on)).valueOf() >= 1 * 1000 * 60 * 60) {
        alertAnim = true;
    }

    let html = `
<div class="boxContainer submittedContainer${alertAnim ? ' alertAnim' : ''}">
	<div class="containerHead">
		<span>${order.ID}</span>
	</div>
	<div class="containerBody">
		<div class="containerBodyData submittedDataContainer"> 
			<span class="dataKey">Customer Name</span><span class="dataDivider">-</span><span class="dataValue">${order.Customer_Name}</span>
			<span class="dataKey">Phone</span><span class="dataDivider">-</span><span class="dataValue">${order.CPN}</span>
			<span class="dataKey">Payment Method</span><span class="dataDivider">-</span><span class="dataValue">${order.Payment_Method}</span>
		</div>
		<div class="date_time"> Submitted on ${order.Submitted_on ? order.Submitted_on : "#" }</div>
	</div>
</div>

`;

    // Insert HTML
    document.querySelector('#submitted_orders').insertAdjacentHTML('beforeend', html);
};

// Function to add accepted box
let acceptedBox = function(order) {

    let html = `
<div class="boxContainer acceptedContainer">
	<div class="containerHead">
		<span>${order.ID}</span>
	</div>
	<div class="containerBody">
		<div class="containerBodyData acceptedDataContainer"> 
			<span class="dataKey">Customer Name</span><span class="dataDivider">-</span><span class="dataValue">${order.Customer_Name}</span>
			<span class="dataKey">Phone</span><span class="dataDivider">-</span><span class="dataValue">${order.CPN}</span>
			<span class="dataKey">Payment Method</span><span class="dataDivider">-</span><span class="dataValue">${order.Payment_Method}</span>
		</div>
		<div class="date_time"> Accepted on ${order.Accepted_on ? order.Accepted_on : "#" }</div>
	</div>
</div>

`;
    // Insert HTML
    document.querySelector('#accepted_orders').insertAdjacentHTML('beforeend', html);
};

// Function to add dispatched box
let dispatchedBox = function(order) {
    let html = `
<div class="boxContainer dispatchedContainer">
	<div class="containerHead">
		<span>${order.ID}</span>
	</div>
	<div class="containerBody">
		<div class="containerBodyData dispatchedDataContainer"> 
			<span class="dataKey">Customer Name</span><span class="dataDivider">-</span><span class="dataValue">${order.Customer_Name}</span>
			<span class="dataKey">Phone</span><span class="dataDivider">-</span><span class="dataValue">${order.CPN}</span>
			<span class="dataKey">Payment Method</span><span class="dataDivider">-</span><span class="dataValue">${order.Payment_Method}</span>
		</div>
		<div class="date_time"> Dispatched on ${order.Dispatched_on ? order.Dispatched_on : "#" }</div>
	</div>
</div>

`;
    // add HTML
    document.querySelector('#dispatched_orders').insertAdjacentHTML('beforeend', html);
};


// Function to add returned box
let returnedBox = function(order) {
    let html = `
<div class="boxContainer returnedContainer">
	<div class="containerHead">
		<span>${order.ID}</span>
	</div>
	<div class="containerBody">
		<div class="containerBodyData returnedDataContainer"> 
			<span class="dataKey">Customer Name</span><span class="dataDivider">-</span><span class="dataValue">${order.Customer_Name}</span>
			<span class="dataKey">Phone</span><span class="dataDivider">-</span><span class="dataValue">${order.CPN}</span>
			<span class="dataKey">Payment Method</span><span class="dataDivider">-</span><span class="dataValue">${order.Payment_Method}</span>
		</div>
		<div class="date_time"> Returned on ${order.Returned_on ? order.Returned_on : "#" }</div>
	</div>
</div>

`;
    // add HTML
    document.querySelector('#returned_orders').insertAdjacentHTML('beforeend', html);

};

// Function to fetch data from creator database
const fetchContact = function(isPreviouslySubmitted) {
    fetch(`${baseURL}index.php/API/getContact/${storeName}`).then(resp => resp.json()).then(data => {
        // Clear submitted Array
        submitted = [];
        console.log("data", data);
        console.log("isPreviouslySubmitted", isPreviouslySubmitted);
        // Validation
        if (data != null && data.length > 0) {

            // Clear all UI orders
            emptyChildElements();
            data.forEach(contact => {
                if (contact.Order_Status == "Submitted") {

                    submitted.push(contact);
                    // Add submitted orders in UI
                    submittedBox(contact);
                } else if (contact.Order_Status == "Accepted") {
                    // Add accepted orders in UI
                    acceptedBox(contact);
                } else if (contact.Order_Status == "Dispatched") {
                    // Add dispatched orders in UI
                    dispatchedBox(contact);
                } else if (contact.Order_Status == "Returned") {
                    // Add returned orders in UI
                    returnedBox(contact);
                }
            });

            // Show main content in UI
            main.style.display = "block";
            loader.style.display = "none";

            // check whether we have last fetched order details( to compare with newly fetched orders)
            if (!isPreviouslySubmitted) {
                if (submitted != null && submitted.length > 0) {
                    // update previously submitted order
                    previouslySubmitted.push(...submitted);
                }
            } else {
                if (submitted != null && submitted.length > 0) {
                    if (previouslySubmitted != null && previouslySubmitted.length > 0) {
                        // Iterate newly fetched submitted orders to compare with previously fetched submitted orders
                        submitted.forEach(function(subData) {
                            // Trigger
                            let newData = true;
                            // Iterate previouslu fetched submitted orders
                            previouslySubmitted.forEach(function(preData) {
                                // trigger condition
                                if (subData.ID == preData.ID) {
                                    newData = false;
                                }

                            });
                           
                            if (newData) {
                            	
                            	/*
                                // check whether the new data available in notification array or not
                                if (notificationArray != null && notificationArray.length > 0) {
                                    newData = notificationArray.some(function(val) {

                                        return (val.ID == subData.ID);
                                    });

                                    if (!newData) {
                                    	
                                        // push order into notification array
                                        notificationArray.push(subData);
                                        playSound(sound);
                                    }
                                } else {
                                	
                                    // push order into notification array
                                    notificationArray.push(subData);
                                    playSound(sound);
                                }
                                */

                            }

                        });

                    } else {

                    }

                    // Update previously fetched order variable
                    previouslySubmitted = [];
                    previouslySubmitted.push(...submitted);


                }

/*
                // Update notification box text content
                notificationText.innerText = `${notificationArray.length} new order${notificationArray.length > 1 ? "s " : " "}has been submitted`;

                // Show notification box
                if (notificationArray != null && notificationArray.length > 0 && notificationBox.classList.contains("hidden")) {
                    notificationBox.classList.remove("hidden");
                }
*/

            }
        }

    }).catch((err) => console.log(err));
}
// // Invoke function to fetch data drom creator
fetchContact(false);
// // Invoke function with setInterval timer
setInterval(fetchContact, .4 * 60 * 1000, true);

// Notify if submitted orders available for every minute


setInterval(function() {
    if (submitted.length > 0) {
        playSound(alarmSound);
        
    }
}, 1 * 1000 * 60);


// Alert box close button event listener
closeButton.addEventListener('click', function() {
    notificationBox.classList.add('hidden');
    notificationArray = [];

});


// submittedBox({"ID":1,"Customer_Name":"Test","Payment_Method":"Cash","CPN":"8870"});
// playSound() ;