const replit_auth_btn = document.querySelector("button#replitAuthBtn");

const enter_url_form = document.querySelector("form#enter-url");
const enter_url_inp = enter_url_form.elements["url"];
const enter_url_subm = enter_url_form.querySelector("input[type=submit]");

const data_table = document.querySelector("table#data > tbody");

const other_actions = document.querySelector("div#other-actions");
const new_key_btn = other_actions.querySelector("button#new-key");
const clear_db_btn = other_actions.querySelector("button#clear-db");

const edit_prompt_container = document.querySelector(
  "div#edit-prompt-container"
);
const edit_prompt = edit_prompt_container.querySelector("div#edit-prompt");
const edit_prompt_txt = edit_prompt.querySelector("textarea");
const edit_prompt_ok = edit_prompt.querySelector("button#edit-prompt-ok");
const edit_prompt_cancel = edit_prompt.querySelector(
  "button#edit-prompt-cancel"
);

let isReplitExtension = /^extension-.+\.repl\.co$/.test(
  window.location.hostname
);

let db = new DB({
  replit
});

let editing_key = null;
let editing = null;

const parsedUrl = new URL(location.href);

enter_url_form.addEventListener("submit", (e) => {
  e.preventDefault();

  db.setURL(enter_url_inp.value);

  // save URL temporarily
  try {
    sessionStorage.setItem("url", enter_url_inp.value);
  } catch {}

  data_table.textContent = "";

  db.list().then((keys) => {
    for (const key of keys) {
      db.get(key, true).then((val) => {
        let parsedVal = null;

        const tr = document.createElement("tr");

        const td1 = document.createElement("td");
        td1.className = "data-key";
        td1.dataset.key = key;

        td1.innerText = '"' + key + '"';

        const td2 = document.createElement("td");
        td2.className = "data-value";

        try {
          parsedVal = JSON.parse(val);
          td2.innerText = JSON.stringify(parsedVal, null, 2);
        } catch {
          td2.innerText = val;
          td2.classList.add("data-invalid");
        }

        const td3 = document.createElement("td");
        td3.className = "data-actions";

        const btn1 = document.createElement("button");
        btn1.className = "actions-edit";

        const btn2 = document.createElement("button");
        btn2.className = "actions-delete";

        td3.appendChild(btn1);
        td3.appendChild(btn2);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        data_table.appendChild(tr);
      });
    }
  });
});

document.addEventListener("click", (e) => {
  if (e.target.matches("table#data td button.actions-edit")) {
    editing_key =
      e.target.parentElement.parentElement.querySelector("td.data-key").dataset
        .key;
    editing = "data";

    db.get(editing_key, true).then((data) => {
      edit_prompt_txt.value = data;

      edit_prompt_container.classList.add("show");

      edit_prompt_txt.focus();
    });
  } else if (e.target.matches("div#edit-prompt button#edit-prompt-cancel")) {
    edit_prompt_container.classList.remove("show");

    edit_prompt_txt.value = "";
  } else if (e.target.matches("div#edit-prompt button#edit-prompt-ok")) {
    if (editing == "data") {
      db.set(editing_key, edit_prompt_txt.value, true).then(() => {
        edit_prompt_container.classList.remove("show");

        edit_prompt_txt.value = "";

        enter_url_form.dispatchEvent(new Event("submit"));
      });
    } else if (editing == "new key") {
      db.set(edit_prompt_txt.value, "").then(() => {
        edit_prompt_container.classList.remove("show");

        edit_prompt_txt.value = "";

        enter_url_form.dispatchEvent(new Event("submit"));
      });
    }
  } else if (e.target.matches("table#data td button.actions-delete")) {
    const key =
      e.target.parentElement.parentElement.querySelector("td.data-key").dataset
        .key;

    db.delete(key).then(() => {
      enter_url_form.dispatchEvent(new Event("submit"));
    });
  }
});

new_key_btn.addEventListener("click", (e) => {
  editing_key = null;
  editing = "new key";

  edit_prompt_txt.value = "";

  edit_prompt_container.classList.add("show");

  edit_prompt_txt.focus();
});

clear_db_btn.addEventListener("click", (e) => {
  console.group("Clearing database...");

  db.list().then((keys) => {
    let deleted = 0;

    for (let i = 0; i < keys.length; i++) {
      db.delete(keys[i]).then(() => {
        console.log(`Deleted key \"${keys[i]}\"`);

        deleted++;

        if (deleted >= keys.length) {
          console.groupEnd("Cleared database successfully");

          enter_url_form.dispatchEvent(new Event("submit"));
        }
      });
    }
  });
});

// get DB url from search params
if (parsedUrl.searchParams.has("url")) {
  // enter URL into input
  enter_url_inp.value = atob(parsedUrl.searchParams.get("url"));

  // submit
  enter_url_subm.click();
}

// get DB url from sessionStorage
else {
  try {
    if (sessionStorage.getItem("url")) {
      // enter URL into input
      enter_url_inp.value = sessionStorage.getItem("url");

      // submit
      enter_url_subm.click();
    }
  } catch {}
}

// Login with Replit button
replit_auth_btn.addEventListener("click", (e) => {
  LoginWithReplit();
});

// Check if is in a Replit Extension
replit.replDb.get('__replit_database_viewer_ext_check').then(resp => {
  isReplitExtension = typeof resp == 'string';

  console.debug('Is Replit extension:', isReplitExtension);
});
