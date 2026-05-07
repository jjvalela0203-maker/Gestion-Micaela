const btnNew = document.getElementById("new");
const btnCancel = document.getElementById("cancel");
const btnCreate = document.getElementById("create");

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
      }),
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

document.addEventListener("DOMContentLoaded", async () => {
    const containerData = document.getElementById("data");
    try{
        const data = await getData();
        data.forEach((element) => {
          const { name, lastname, url, description, birthdate, color } = element;
          const card = document.createElement("div");
          // esto tambien lo agregue yo, sin esto el buscador no sabe el nombre de cada carta
          card.dataset.name = (name + " " + lastname).toLowerCase();
          // aca termina lo que agregue.
          card.innerHTML = `<div
          class="bg-${color?color:"pink"}-100 p-3 rounded rounded-lg flex flex-col items-center space-y-2"
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
                card.remove();
              } catch (error) {
                console.error("Error al eliminar:", error);
              }
            }
          });

          containerData.appendChild(card);
        });
    }catch{
        containerData.innerText = "No hay datos para mostrar";
    }
});