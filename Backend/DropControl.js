// Fungsi untuk menampilkan input sesuai dengan operasi yang dipilih
function showInputFields(operation) {
    const locationInput = document.getElementById("locationInput");
    const chargerPointInput = document.getElementById("chargerPointInput");
    const parkPointInput = document.getElementById("parkPointInput");
    const busStopInput = document.getElementById("busStopInput");

    locationInput.style.display = "block";
    chargerPointInput.style.display = "none";
    parkPointInput.style.display = "none";
    busStopInput.style.display = "none";

    if (operation === "add") {
        chargerPointInput.style.display = "block";
        parkPointInput.style.display = "block";
        busStopInput.style.display = "block";
    } else if (operation === "update") {
        locationInput.style.display = "block";
        chargerPointInput.style.display = "block";
        parkPointInput.style.display = "block";
        busStopInput.style.display = "block";
    } else if (operation === "delete") {
        locationInput.style.display = "block";
    }
}

// Fungsi untuk mengirim data drop point ke server
async function submitDropPoint(event) {
    event.preventDefault();

    const form = document.getElementById("dropPointForm");
    const operation = form.elements.operation.value;
    const location = form.elements.location.value;
    const chargerPoint = form.elements.chargerPoint.checked ? 1 : 0;
    const parkPoint = form.elements.parkPoint.checked ? 1 : 0;
    const busStop = form.elements.busStop.checked ? 1 : 0;

    try {
        // Kirim data ke server sesuai operasi yang dipilih
        if (operation === "add") {
            const response = await fetch("/api/drop_points", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ location, chargerPoint, parkPoint, busStop }),
            });
            const data = await response.json();
            console.log(data);
        } else if (operation === "update") {
            const response = await fetch(`/api/drop_points/${location}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ chargerPoint, parkPoint, busStop }),
            });
            const data = await response.json();
            console.log(data);
        } else if (operation === "delete") {
            const response = await fetch(`/api/drop_points/${location}`, {
                method: "DELETE",
            });
            const data = await response.json();
            console.log(data);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    form.reset();
}

// Event listener untuk mengubah tampilan input sesuai dengan operasi yang dipilih
const operationSelect = document.getElementById("operation");
operationSelect.addEventListener("change", (event) => {
    const selectedOperation = event.target.value;
    showInputFields(selectedOperation);
});

// Event listener untuk submit form
const dropPointForm = document.getElementById("dropPointForm");
dropPointForm.addEventListener("submit", submitDropPoint);