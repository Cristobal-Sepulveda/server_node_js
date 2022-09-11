console.log("main.js se sirve correctamente");

const loadInitialTemplate = () => {
  const template = `
    <h1>Usuarios</h1>
    <form id="user-form">
        <div>
            <label>Nombre</label>
            <input name="name"/>
        </div>
        <div>
            <label>Apellido</label>
            <input name="lastname"/>
        </div>
        <button type="submit">Enviar</button>
    </form>
    <ul id="user-list"></ul>
  `;

  const body = document.getElementsByTagName("body")[0];
  body.innerHTML = template;
};

const getUsers = async () => {
  //esta respuesta es ilegible para trabajarla, por lo cual con
  const response = await fetch("/users");
  console.log(response);
  //esto lo convertimos en un json
  const users = await response.json();
  console.log(users);
  const template = (user) => `
    <li>
        ${user.name} ${user.lastname} <button data-id="${user._id}">Eliminar</button>
    </li>
  `;

  const userList = document.getElementById("user-list");
  userList.innerHTML = users.map((user) => template(user)).join("");

  users.forEach((user) => {
    const userNode = document.querySelector(`[data-id="${user._id}"]`);
    userNode.onclick = async (e) => {
      await fetch(`/users/${user._id}`, {
        method: "DELETE",
      });
      userNode.parentNode.remove();
      alert("eliminado con exito");
    };
  });
};

const addFormListener = () => {
  const userForm = document.getElementById("user-form");
  userForm.onsubmit = async (e) => {
    e.preventDefault();
    console.log("holaa");
    const formData = new FormData(userForm);
    // console.log(formData.get("name"));
    // console.log(formData.entries());
    //esto transforma los valores de un formulario en un objeto
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    await fetch("/users", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    userForm.reset();
    getUsers();
  };
};
//window es un objeto global q hace referencia
//a la ventana de nuestro explorador
//y onload es la funcion que se va a ejecutar una vez
//que haya cargado todo el contenido de nuestra ventana

window.onload = () => {
  loadInitialTemplate();
  addFormListener();
  getUsers();
};
