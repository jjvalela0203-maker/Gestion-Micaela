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

btnCancel.addEventListener("click", (event) => {
  event.preventDefault(); // Evita que el botón actúe como submit si está dentro del form
  document.getElementById("formulario").classList.add("hidden");
  btnNew.disabled = false;
});

async function refreshData() {
  const containerData = document.getElementById("data");
  containerData.innerHTML = "";
  try {
    const data = await getData();
    if (data.length === 0) {
      containerData.innerHTML = "<p class='text-center w-full'>No hay datos para mostrar</p>";
      return;
    }

    data.forEach((element) => {
      const { name, lastname, url, description, birthdate, color } = element;
      const card = document.createElement("div");
      // esto tambien lo agregue yo, sin esto el buscador no sabe el nombre de cada carta
      card.dataset.name = (name + " " + lastname).toLowerCase();
      // aca termina lo que agregue.
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

      const btnDelete = card.querySelector("#delete");
      btnDelete.addEventListener("click", async () => {
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar a ${name}?`);
        
        if (confirmDelete) {
          try {
            await fetch(`http://localhost:3000/micaela/${element.id}`, {
              method: "DELETE",
            });
            refreshData();
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
            refreshData();
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
    containerData.innerText = "Error al cargar los datos";
  }
}

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
  const formulario = document.getElementById("formulario");
  const form = document.getElementById("formData");
  try {
    const name = document.getElementById("name").value;
    const lastname = document.getElementById("lastname").value;
    const birthdate = document.getElementById("birthdate").value;
    const description = document.getElementById("description").value;
    const color = document.getElementById("color").value;
    const url = document.getElementById("url").value;

    const response = await fetch("http://localhost:3000/micaela", {
      method: "POST",
      // le tuve que agregar esto porque sin el header el servidor no entiende que le mandan json y no guarda nada
      headers: {
        "Content-Type": "application/json",
      },
      // aca termina lo que agregue.
      body: JSON.stringify({
        name: name,
        url: url,
        lastname: lastname,
        description: description,
        birthdate: birthdate,
        color: color,
      }),
    }); 
    // Si la respuesta no tiene problemas, refresca y borra el formulario, si no, no hace nada y el usuario puede corregir lo que haya salido mal
    if (response.ok) {
      await refreshData();
      form.reset(); // Limpia todos los campos del formulario
      formulario.classList.add("hidden"); // Oculta el formulario
      btnNew.disabled = false; // Habilita el botón "Nuevo"
    }
  }
  catch (e) {
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

// aca empieza mi parte, el buscador
document.getElementById("search").addEventListener("click", () => {
  const query = document.querySelector("#buttons input[type='text']").value.toLowerCase().trim();
  const cards = document.querySelectorAll("#data > div");
  cards.forEach((card) => {
    if (!query || card.dataset.name.includes(query)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});
// aca termina mi parte

document.addEventListener("DOMContentLoaded", () => {
  refreshData();
});