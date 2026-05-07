const btnNew = document.getElementById("new");
const btnCancel = document.getElementById("cancel");
const btnCreate = document.getElementById("create");

addEventListener("DOMContentLoaded", () => {
  birthdate.max = new Date().toISOString().split("T")[0];
});

btnNew.addEventListener("click", () => {
  document.getElementById("formulario").classList.remove("hidden");
  btnNew.disabled = true;
});

btnCancel.addEventListener("click", () => {
  document.getElementById("formulario").classList.add("hidden");
  btnNew.disabled = false;
});

const calculateAge = (birthdate) => {
    if (!birthdate) return "N/A";
    const birthDateObj = new Date(birthdate);
    if (isNaN(birthDateObj.getTime())) return "N/A";

    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};
async function sendData() {
  btnCreate.disabled = true;
  try {
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const birthdate = document.getElementById("birthdate").value;
    const description = document.getElementById("description").value;
    const color = document.getElementById("color").value;
    const url = document.getElementById("url").value;

    const response = await fetch("http://localhost:3000/micaela", {
      method: "POST",
      body: JSON.stringify({
        name: name,
        url: url,
        lastname: lastname,
        description: description,
        birthdate: birthdate,
        color: color,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
  } catch (e) {
    console.error(e);
  } finally {
    btnCreate.disabled = false;
  }
}

document.getElementById("formulario").addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
});

async function getData() {
  const response = await fetch("http://localhost:3000/micaela");
  const data = await response.json();
  return data;
}

document.addEventListener("DOMContentLoaded", async () => {
    const containerData = document.getElementById("data");
    try{
        const data = await getData();
        data.forEach((element) => {
          const { name, lastname, url, description, birthdate, color } = element;
          const card = document.createElement("div");
          card.innerHTML = `<div
          class="bg-${color?color:"pink"}-100 p-3 rounded rounded-lg flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300 m-4"
      >
          <article>
          <h3 class="text-2xl font-bold">${name} ${lastname}</h3>
          </article>
          <figure class="flex flex-col items-center space-y-2 h-60 w-64 md:w-full">
          <img
              src="${url}"
              alt="${name} ${lastname}"
              class="w-full h-full object-contain"
          />
          <span class="text-lg text-stone-500 m- ">Edad: ${calculateAge(birthdate)}</span>
          </figure>
          <article class="text-justify p-3 m-6">
          <p>
              ${description}
          </p>
          </article>
          <section id="actions" class="flex justify-around w-full py-2">
          <div>
              <button id="edit" class="bg-orange-300 hover:bg-amber-500 hover:text-stone-100 px-5 py-2 rounded">Editar</button>
          </div>
          <div></div>
          <div>
              <button id="delete" class="bg-red-400 hover:text-stone-100 hover:bg-red-600 px-5 py-2 rounded">Eliminar</button>
          </div>
          </section>
      </div>`;

          // Buscamos el botón de eliminar que acabamos de crear dentro de esta tarjeta específica
          const btnDelete = card.querySelector("#delete");
          btnDelete.addEventListener("click", async () => {
            // Agregamos la confirmación
            const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar a ${name}?`);
            
            if (confirmDelete) {
              try {
                await fetch(`http://localhost:3000/micaela/${element.id}`, {
                  method: "DELETE",
                });
                card.remove(); // Esto elimina la tarjeta visualmente sin recargar
              } catch (error) {
                console.error("Error al eliminar:", error);
              }
            }
          });
          const btnEdit = card.querySelector("#edit");
          btnEdit.addEventListener("click", async () => {
            const quedesea = confirm("deseas editar?"); 

            console.log(quedesea);
            if (!quedesea) return; // Si el usuario cancela la edición 
            const fieldToEdit = prompt("¿Qué campo deseas editar? (name, lastname, description, birthdate, url, color)");
            if (!fieldToEdit) return; // Si el usuario cancela el prompt
            const validFields = ["name", "lastname", "description", "birthdate", "url", "color"];
            if (!validFields.includes(fieldToEdit)) {
              alert("Campo no válido. Por favor, elige uno de los siguientes: name, lastname, description, birthdate, url, color.");
              return;
            }
            const newValue = prompt(`Ingrese el nuevo valor para ${fieldToEdit}:`, element[fieldToEdit]);
            if (newValue) {
              try {
                await fetch(`http://localhost:3000/micaela/${element.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...element,
                    [fieldToEdit]: newValue,
                  }),
                });
                // Actualizamos el campo editado en la tarjeta sin recargar   
                if (fieldToEdit === "name" || fieldToEdit === "lastname") {
                  const nameElement = card.querySelector("h3");
                  nameElement.textContent = `${fieldToEdit === "name" ? newValue : name} ${fieldToEdit === "lastname" ? newValue : lastname}`;
                } else if (fieldToEdit === "description") {
                  const descriptionElement = card.querySelector("article p");
                  descriptionElement.textContent = newValue;
                } else if (fieldToEdit === "url") {
                  const imgElement = card.querySelector("figure img");
                  imgElement.src = newValue;
                } else if (fieldToEdit === "color") {
                  card.firstChild.className = `bg-${newValue}-100 p-3 rounded rounded-lg flex flex-col items-center space-y-2`;
                }
              } catch (error) {
                console.error("Error al editar:", error);
              }
            } else {
              alert("No se ingresó un nuevo valor. La edición ha sido cancelada.");
            }     
            
          });

          containerData.appendChild(card);
        });
    }catch{
containerData.innerText= "No hay datos para mostrar"
    }
});
