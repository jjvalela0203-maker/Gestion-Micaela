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

document.addEventListener("DOMContentLoaded", async () => {
    const containerData = document.getElementById("data");
    try{
        const data = await getData();
        data.forEach((element) => {
          const { name, lastname, url, description, birthdate, color } = element;
          const card = document.createElement("div");
          card.innerHTML = `<div
          class="bg-${color?color:"pink"}-100 p-3 rounded rounded-lg flex flex-col items-center space-y-2"
      >
          <article>
          <h3 class="text-2xl font-bold">${name} ${lastname}</h3>
          </article>
          <figure class="flex flex-col items-center space-y-2 h-60 w-64 md:w-100    ">
          <img
              src="${url}"
              alt="${name} ${lastname}"
          />
          <span class="text-lg text-stone-500">Edad: ${birthdate}</span>
          </figure>
          <article class="text-justify p-3">
          <p>
              ${description}
          </p>
          </article>
          <section id="actions" class="flex justify-around w-full py-2">
          <div>
              <button class="bg-orange-300 hover:bg-amber-500 hover:text-stone-100 px-5 py-2 rounded">Editar</button>
          </div>
          <div></div>
          <div>
              <button class="bg-red-400 hover:text-stone-100 hover:bg-red-600 px-5 py-2 rounded">Eliminar</button>
          </div>
          </section>
      </div>`;
          containerData.appendChild(card);
        });
    }catch{
containerData.innerText= "No hay datos para mostrar"
    }
});


