
let functionList;
let openFunctionsDiv = [];
let functionData_handlers =[]

let holder = document.getElementById("popupOverlay")



const fnBar = {
  init: init_functionList,
  show:showMenu,
  hide:hideMenu
}

function init_functionList(){
  /*
  functionList = document.getElementById('functionList')

  hideMenu()


  holder.addEventListener("click", ()=>{
    console.log("clicked fn list item")
  })
  dealWithToolPackages(0, {
    name: "Gardens",
      sidebarData:{
        onclick: ()=>{},
        functions: [
                [()=>{},   "build"],
                ]
      },
    }
  )


  renderFunctionList(functionData_handlers, functionList);
  */
}

function duct_tape_addFunctions_andShow (array) {// array of [ "recipe text", fn onclick]
  parent = document.getElementById("functionHolder")
  functionList = document.createElement("div");
  functionList.id = "fnList"
  parent.appendChild(functionList)

  document.getElementById("functionBackground").addEventListener("click", ()=>{
    hideMenu()
  })

  for (let i = 0; i < array.length; i++) {
    var text = array[i][0]
    var fn =  array[i][1]
    var button = document.createElement("button")
    button.innerHTML = text
    functionList.appendChild(button)

    button.addEventListener("click", fn)
  }

}


function showMenu (array){
  holder.style.display = 'block'
  duct_tape_addFunctions_andShow(array)
}

function hideMenu (){
  holder.style.display = 'none'
  document.getElementById("fnList")?.remove();
}


/*
let penciltoolPackage = {
  name: "Gardens",
  sidebarData:{
    onclick: ()=>{},
    functions: [  [()=>{pencilTool_deleteLastStroke()},   "delete last"],
            [()=>{pencilTool_endShape(true)},   "new (filled)"],
            [()=>{pencilTool_endShape(false)},    "new (no fill)"],
            ]
  },
}
*/


/// now my text

const popupText = {
  init: initPopup,
  setHeader: (text)=>{ popup_header.innerHTML = text.toUpperCase()},
  setBody: (text)=>{ popup_text.innerHTML = text},
  //setImage: (path)=>{img.src = path},
  show: popup_show,
  hide: popup_hide,
  fast: popup_fast
}

const popup = document.getElementById("popupText");
const popup_header = popup.querySelector("h2");
const popup_text = popup.querySelector("p");
const popup_img = popup.querySelector("img");
const fast_popup = document.getElementById("fastPopupText")
var popup_canClickAway = true // so you don't accidentally get rid of the popup

function initPopup(){
  //popup_img.src = "assets/testSquare.png"
  popup.addEventListener("click",()=>{popup_hide()})
  popup_hide()
  fast_popup.style.display = "none";

}

function popup_hide(){
  if (popup_canClickAway == false){
    return
  }
  popup.style.display = "none"
}
function popup_show(){

  popup.style.display = "block"
  popup_canClickAway = false
  setTimeout(()=>{popup_canClickAway = true}, 1000)
}

function popup_showFast() {
    fast_popup.style.display = "block";

    // Restart the animation
    fast_popup.classList.remove("popup-enter");
    void fast_popup.offsetWidth; // Force reflow
    fast_popup.classList.add("popup-enter");
}

function popup_fast(text){
  popup_showFast()

  fast_popup.querySelector("strong").innerHTML = text
  setTimeout( ()=>{fast_popup.style.display="none"}, 300);
}