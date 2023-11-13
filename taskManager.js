
// Url
const apiUrl = "https://654d7455cbc3253557419455.mockapi.io/tasks/";

// Get date?
const setMyDate = (date) => {
    var year = new Date(date).getFullYear();
    var month = new Date(date).getMonth();
    var day = new Date(date).getDate();
    var hours = new Date(date).getHours();
    var minutes = new Date(date).getMinutes();
    var seconds = new Date(date).getSeconds();
    return ([year, month, day, hours, minutes, seconds]);
}

const getMyDate = (date) => {
    const newDate = new Date(
        date[0],
        date[1],
        date[2],
        date[3],
        date[4],
        date[5]
    ); 
    return (newDate);
}

// Get data
let data;
const getData = async(url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Update data
const updateData = async(url, taskToUpdate) => {
    fetch(url, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(taskToUpdate)
    })
}

// Post data
const postData = async(url, taskToPost) => {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(taskToPost)
    })
}

// Fetch data
window.addEventListener("load", async() => {

    data = await getData(apiUrl);

    // console.log(data);

    let taskList = document.querySelector(".taskList");
    for (let i = 0; i < data.length; i++) {
        let task = document.createElement("div");
        
        task.innerHTML = `
        <div class="toPlay">
        <h4 class="taskTitulo">${data[i].title}</h4>
        <h4 class="taskFecha">${getMyDate(data[i].createdAt).toLocaleString('es-AR')}</h4>
        </div>
        <button class="playerBtn" onclick="textToSpeech(event)">
        <i class="playIcon bi bi-play-circle-fill"></i>
        </button>
        `;
        
        task.classList.add("task");
        task.classList.add(`${data[i].state}`);
        task.setAttribute("id", `${data[i].id}`);
        
        taskList.appendChild(task);
        }
});


// Show options
window.addEventListener("load", async()=> {

    // Fetchdata
    data = await getData(apiUrl);

    let taskListContainer = document.querySelector("#task-selector");
    for (let i = 0; i < data.length; i++) {
        let taskOption = document.createElement("option");
        taskOption.value = data[i].title;
        taskOption.innerText = `
            ${data[i].title}
        `;

        taskListContainer.appendChild(taskOption);
    }

});

// Load data from the select option
var taskSelector = document.querySelector("#task-selector");

taskSelector.addEventListener("change", async() => {
    // Fetch data
    data = await getData(apiUrl);
    // console.log(data);
    // <select>
    var taskContent = document.querySelector("#task-content");

    // Empty task
    let taskToChange = null;

    // Remove every child from the task
    if (taskContent.hasChildNodes) {
        while (taskContent.firstChild) {
            taskContent.removeChild(taskContent.firstChild);
        }
    }

    // Find a task based on the <select>
    taskToChange = data.find(item => item.title === taskSelector.value);

    // Show state of task
    document.querySelector("#estado-conclusion").value = taskToChange.state;

    // Create task content
    var taskToShow = document.createElement("div");
    taskToShow.innerHTML = `
        <div>
            <h2>${taskToChange.title}</h2>
            <p>${taskToChange.description}</p>
        </div>
    `;
    taskContent.appendChild(taskToShow);

    // Empty the task
    taskToChange = null;
});

// Chambiar estado
document.querySelector(".updateBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    
    // Fetch Data
    data = await getData(apiUrl);

    // Find
    let taskToChange = data.find(item => item.title === taskSelector.value);

    // Check state
    let estadoConclusion = document.querySelector("#estado-conclusion").value;
    if (estadoConclusion === "concluido") {
        let dateNow = new Date(Date.now());
        let dateArray = setMyDate(dateNow);
        
        taskToChange.doneAt = [...dateArray];
        taskToChange.state = "concluido";
    }

    // Put the task
    updateData(`${apiUrl}/${taskToChange.id}`, taskToChange);
})


// Limpiar inputs
const clearFields = () => {
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
}

// Aniadir datos
// document.querySelector("#add-task-form").addEventListener("submit", (e) => {
document.querySelector(".addDataBtn").addEventListener("click", (e) => {
    e.preventDefault();

    let fecha = new Date(Date.now());
    let titulo = document.getElementById("titulo").value;
    let descripcion = document.getElementById("descripcion").value;
    let estado = document.getElementById("estado").value;

    let taskToCreate = {};

    if (titulo == "" || descripcion == "") {
        // Show alert
        alert("invalid data")
    } else {
        // Create task
        if (Object.keys(taskToCreate).length == 0) {
            taskToCreate.createdAt = setMyDate(fecha);
            taskToCreate.doneAt = []
            taskToCreate.title = titulo;
            taskToCreate.description = descripcion;
            taskToCreate.state = estado ? estado : "pendiente";
            
            postData(apiUrl, taskToCreate);

            taskToCreate = {}; 
        }
    }

    clearFields();
});





let voices = [];
let speechSpeed = document.querySelector("#audio-speed");
const voiceSelector = document.querySelector("#voice-selector");
const synthesis = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();

// let textToPlay;
const textToSpeech = (event) => {
    let taskFromPlay = event.target.parentNode.parentNode;
    let textToPlay = taskFromPlay.querySelector(".toPlay");

    const playText = () => {
        utterance.text = textToPlay.innerText;
        utterance.rate = speechSpeed.value;
        utterance.voice = voices[voiceSelector.selectedIndex];

        synthesis.speak(utterance);
    }

    playText();
}
const getSpeechVoices = () => {
    voices = synthesis.getVoices();
    // console.log(voices);

    voices.forEach(voice => {
        const voiceOption = document.createElement("option");
        voiceOption.value = voice.name;
        voiceOption.textContent = `${voice.name} (${voice.lang})`;
        voiceSelector.appendChild(voiceOption);
    });
};

getSpeechVoices();



// Toggle

// Add
let addTaskSection = document.querySelector("#add-task-form-section");

document.querySelector("#nav-new-task").addEventListener("click", () => {
    let style = getComputedStyle(addTaskSection);
    if (style.display === 'none') {
        addTaskSection.style.display = 'block';
    } else {
        addTaskSection.style.display = 'none';
    }
})

document.querySelector("#newCloseBtn").addEventListener("click", () => {
    if (addTaskSection.style.display === 'block') {
        addTaskSection.style.display = 'none';
    }
})



// Update
let updateSection = document.querySelector("#update-task-form-section");

document.querySelector("#nav-update-task").addEventListener("click", () => {
    let style = getComputedStyle(updateSection);
    if (style.display === 'none') {
        updateSection.style.display = 'block';
    } else {
        updateSection.style.display = 'none';
    }
})

document.querySelector("#updateCloseBtn").addEventListener("click", () => {
    if (updateSection.style.display === 'block') {
        updateSection.style.display = 'none';
    }
})


// Settings
let settingsSection = document.querySelector("#settings-form-section");

document.querySelector("#nav-settings").addEventListener("click", () => {
    let style = getComputedStyle(settingsSection);
    if (style.display === 'none') {
        settingsSection.style.display = 'block';
    } else {
        settingsSection.style.display = 'none';
    }
})

document.querySelector("#settingsCloseBtn").addEventListener("click", () => {
    if (settingsSection.style.display === 'block') {
        settingsSection.style.display = 'none';
    }
})


// Create mobile menu
document.querySelector("#menuIconContainer").addEventListener("click", () => {
    console.log("you clicked the icon");
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = `
        <i class="closeMenuIcon bi bi-x-circle"></i>
        <div class="buttons-container-mobile">
            <button class="nav-button" id="nav-new-task-m">Nueva tarea</button>
            <button class="nav-button" id="nav-update-task-m">Actualizar</button>
            <button class="nav-button" id="nav-settings-m">Configuraciones</button>    
        </div>
    `
    tempDiv.classList.add("container-mobile");

    // Get functions
    // Attach event listener to the close button
    let closeBtn = tempDiv.querySelector(".closeMenuIcon");
    closeBtn.addEventListener("click", () => {
        if (getComputedStyle(document.querySelector(".container-mobile")).display === 'block') {
            closeMobileMenu();
        }
    });

    // Attach event listener to the new task button
    let newTaskBtn = tempDiv.querySelector("#nav-new-task-m");
    newTaskBtn.addEventListener("click", () => {
        let style = getComputedStyle(addTaskSection);
        if (style.display === 'none') {
            addTaskSection.style.display = 'block';
            closeMobileMenu();
        } else {
            addTaskSection.style.display = 'none';
        }
    });

    // Attach event listener to the update task button
    let updateTaskBtn = tempDiv.querySelector("#nav-update-task-m");
    updateTaskBtn.addEventListener("click", () => {
        let style = getComputedStyle(updateSection);
        if (style.display === 'none') {
            updateSection.style.display = 'block';
            closeMobileMenu();
        } else {
            updateSection.style.display = 'none';
            // closeMobileMenu();
        }
    });

    // Attach event listener to the settings button
    let settingsBtn = tempDiv.querySelector("#nav-settings-m");
    settingsBtn.addEventListener("click", () => {
        let style = getComputedStyle(settingsSection);
        if (style.display === 'none') {
            settingsSection.style.display = 'block';
        } else {
            settingsSection.style.display = 'none';
        }
        console.log("you clicked the settings for mobile")
    });

    // Append the child
    document.body.appendChild(tempDiv);
})

const closeMobileMenu = () => {
    let style = getComputedStyle(document.querySelector(".container-mobile"))
    if (style.display === 'block') {
        document.querySelector(".container-mobile").style.display = 'none';
        console.log("clicked from inside");
    }
    console.log("you clicked the close menu for mobile")
}


