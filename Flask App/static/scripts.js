async function appendResponse(){
  var chat_field = document.getElementById("chat-input");
  var user_input = chat_field.value;
  var html_data = '';
  //
  html_data += `
  <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3 align-items-right">
    <div class="d-flex gap-2 w-100 justify-content-end">
      <p class="text-right mb-0 opacity-100">${user_input}</p>
    </div>
    <i class="bi bi-person" style="font-size: 1rem; color: white;"></i>
  </a>
  `;
  var text_list = document.getElementById("list-group");
  text_list.innerHTML += html_data;
  chat_field.disabled = true;
  chat_field.value = "";
  var ask_btn = document.getElementById("ask-button");
  ask_btn.disabled = true;
  ask_btn.innerHTML = `
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  Generating response...
  `;
  const response = await fetch("/", {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify({ 'user_dialog': user_input })
  }).catch((err) => {
    console.error(err);
  });
  console.log(response);
  var html_model_response = '';
  var model_output_json;
  var model_output;
  if (response.ok) {
    model_output_json = await response.json();
    model_output = model_output_json['output'];
    console.log(model_output);
  }
  else {
    model_output = 'Error. Please try again.';
  }
  html_model_response += `
  <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3">
    <i class="bi bi-robot" style="font-size: 1rem; color: white;"></i>
    <div class="d-flex gap-2 w-100 justify-content-between">
      <div>
        <p class="mb-0 opacity-100">${model_output}</p>
      </div>
    </div>
  </a>
  `
  text_list.innerHTML += html_model_response;
  chat_field.disabled = false;
  ask_btn.innerHTML = `Ask`;
  ask_btn.disabled = false;
  autoScroll();
  chat_field.focus();
  chat_field.select();
}

function chatEnterKey(event){
  if (event.key === "Enter") {
    document.getElementById("ask-button").click();
  }
}

async function resetChat(){
  var chat_field = document.getElementById("chat-input");
  chat_field.disabled = true;
  const response = await fetch("/", {
    method: "DELETE", 
    headers: {
      "Content-Type": "application/json"
    }
  }).catch((err) => {
    console.error(err);
  });
  var reset_output = '';
  reset_output += `
  <a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3">
    <i class="bi bi-robot" style="font-size: 1rem; color: white;"></i>
      <div class="d-flex gap-2 w-100 justify-content-between">
        <div>
          <p class="fw-bold mb-0 opacity-100">New chat started</p>
        </div>
      </div>
  </a>
  `
  document.getElementById("list-group").innerHTML += reset_output;
  chat_field.disabled = false;
  autoScroll();
  chat_field.focus();
  chat_field.select();
}

function clearChat(){
  resetChat();
  var text_list = document.getElementById("list-group");
  text_list.innerHTML = '';
}

function autoScroll(){
  reset_btn = document.getElementById("reset-button");
  reset_btn.scrollIntoView({
  behavior: 'smooth'
  });
}