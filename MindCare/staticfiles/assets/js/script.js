document.addEventListener("DOMContentLoaded", function () {
  let today = new Date().toISOString().split("T")[0];
  document.getElementById("appointment-date").setAttribute("min", today);

  document.querySelectorAll(".book-appointment-btn").forEach(button => {
      button.addEventListener("click", function () {
          let professionalId = this.getAttribute("data-professional-id");
          let professionalName = this.getAttribute("data-professional-name");
          let specialty = this.getAttribute("data-specialty");

          let availableSlotsAttr = this.getAttribute("data-available-slots");
          let availableSlots = availableSlotsAttr ? availableSlotsAttr.split(",") : [];

          console.log("Available slots received:", availableSlots);  // ✅ Debugging

          // Update modal fields
          document.getElementById("modal-professional-id").value = professionalId;
          document.getElementById("modal-professional-name").textContent = professionalName;
          document.getElementById("modal-specialty").textContent = specialty;

          let timeSelect = document.getElementById("appointment-time");
          timeSelect.innerHTML = "";

          if (availableSlots.length === 0 || availableSlots[0] === "") {
              let option = document.createElement("option");
              option.textContent = "No available slots";
              option.disabled = true;
              option.selected = true;
              timeSelect.appendChild(option);
          } else {
              availableSlots.forEach(slot => {
                  let option = document.createElement("option");
                  option.value = slot.trim();
                  option.textContent = slot.trim();
                  timeSelect.appendChild(option);
              });
          }

          // Open modal
          let modalElement = document.getElementById("appointment-modal");
          let modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
      });
  });

  // Handle form submission
  document.getElementById("appointment-form").addEventListener("submit", function (event) {
      event.preventDefault();

      let formData = new FormData(this);
      let professionalId = formData.get("professional");
      let selectedSlot = formData.get("time");

      fetch("/book_appointment/", {
          method: "POST",
          body: formData,
          headers: {
              "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value
          }
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              alert("Appointment booked! Check your email for the Google Meet link.");

              document.getElementById("meet-link").href = data.google_meet_link;
              document.getElementById("meet-link").textContent = "Join Google Meet";
              document.getElementById("success-popup").style.display = "block";

              let modalElement = document.getElementById("appointment-modal");
              let modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance.hide();

              document.getElementById("appointment-form").reset();
          } else {
              alert(data.error || "Failed to book appointment.");
          }
      })
      .catch(error => {
          console.error("Error booking appointment:", error);
          alert("Error booking appointment. Please try again.");
      });
  });
});
