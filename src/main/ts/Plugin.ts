import { document, HTMLElement, alert } from "@ephox/dom-globals";
import { Editor } from "tinymce";
import * as katex from "katex";

declare const tinymce: any;

const setup = (editor: Editor, url) => {
  const $$ = tinymce.dom.DomQuery;
  let jQuery;
  // sets the cursor to the specified element, ed ist the editor instance
  // start defines if the cursor is to be set at the start or at the end
  function setCursor(ed, element, start) {
    const doc = ed.getDoc();
    if (typeof doc.createRange !== "undefined") {
      const range = doc.createRange();
      range.selectNodeContents(element);
      range.collapse(start);
      const win = doc.defaultView || doc.parentWindow;
      const sel = win.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof doc.body.createTextRange !== "undefined") {
      const textRange = doc.body.createTextRange();
      textRange.moveToElementText(element);
      textRange.collapse(start);
      textRange.select();
    }
  }

  /* editor.addButton("separator", {

    icon: false,
    onclick: () => {
      editor.execCommand(
        "mceInsertContent",
        false,
        `<p style="line-height:1px; width: 100%; border-top:1px solid #636363; margin:0; padding: 0;"></p><p></p>`
      );
      editor.insertContent(`<p></p>`);
    }
  }); */

  editor.on("init", function(event) {
    jQuery = editor.getWin().parent.jQuery;
  });

  editor.on("change", function(e) {
    console.log(e);
    console.log(e.element);
  });

  editor.addButton("latex", {
    text: "katex",
    classes: "katex-editor",
    // image: tinymce.baseURL + "/plugins/separator/assets/icons/separator.png",
    icon: false,
    onclick: () => {
      // tslint:disable-next-line:no-console
      create_katex_editor();
      // createEquation();
    }
  });

  /* const insert_equation = (container: HTMLElement) => {
    const equ = "\\left(x+y\\right)^n=\\sum_{k=0}^{n} \\binom{n}{k}x^ky^{n-k}";

    container.innerHTML = `
    <span class="math">
    ${equ}
    </span>
  `.trim();
    container.focus();

    rerenderLaTeX();
  };

  const rerenderLaTeX = () => {
    const body = editor.dom.getRoot();
    const spans = $$(body).find("span.math");

    console.log("Rendering katex, found " + spans.length + " spans");

    spans.each(index => {
      const span = spans[index];
      const equation = span.innerHTML;

      katex.render(equation, span, { displayMode: true });
    });
  }; */

  const on_editor_node_change = function(e) {
    if (!e) {
      return;
    }
    const element: HTMLElement = e.element;
    if (!element) {
      return;
    }

    // check editor activeness
    const isEditor = findUpClass(element, "katex_outer");
    if (!isEditor) {
      console.log(">editor is not active");
      jQuery(".mce-katex-editor").removeClass("mce-active");
      disable_katex_editor();
    } else {
      console.log(">editor is active");
      jQuery(".mce-katex-editor").addClass("mce-active");
    }

    // check if editor should be active
    /* const katex_inner = findUpClass(element, "katex_inner");
    if (katex_inner) {
      jQuery(".mce-katex-editor").addClass("mce-active");
      // wrap parentNode into a katex_outer
      enable_katex_editor(katex_inner);
    } else {
      jQuery(".mce-katex-editor").removeClass("mce-active");
      disable_katex_editor();
    } */
  };

  const findUpClass = function(el, className) {
    if (el.classList && el.classList.contains(className)) {
      return el;
    }
    while (el.parentNode) {
      el = el.parentNode;
      if (el.classList && el.classList.contains(className)) {
        return el;
      }
    }
    return null;
  };
  /*

  const toWrappedContent = function(element) {
    if (element.nodeName.toLowerCase() === "body") {
      const parent = element;
      const wrapper = parent.createElement("div");
      wrapper.appendChild(element);
      return wrapper;
    } else {
      const parent = element.parentNode;
      const wrapper = document.createElement("div");

      // set the wrapper as child (instead of the element)
      parent.replaceChild(wrapper, element);
      // set element as child of wrapper
      wrapper.appendChild(element);
      return wrapper;
    }
  }; */

  const toUnwrappedContent = function(element, className) {
    // get the element's parent node
    const parent = findUpClass(element, className);
    if (!parent) {
      return null;
    }
    const granParent = parent.parentNode;

    // move all children out of the element
    while (parent.firstChild) {
      granParent.insertBefore(parent.firstChild, parent);
    }

    // remove the empty element
    granParent.removeChild(parent);

    return granParent;
  };

  const create_katex_editor = () => {
    // get the current selection
    // const selection = (editor.selection && editor.selection.getNode()) || null;
    /* if (!selection) {
      return;
    } */

    editor.windowManager.open({
      title: "Insert latex",
      body: { type: "textbox", name: "my_textbox" },
      style: "",
      onsubmit: function(e) {
        const katex_wrapper = document.createElement("span");
        katex_wrapper.className = "katex-wrapper mceNoEditor active";
        // katex_wrapper.style.display = "inline-block";
        const equ = e.data.my_textbox;
        // "\\left(x+y\\right)^n=\\sum_{k=0}^{n} \\binom{n}{k}x^ky^{n-k}";
        katex_wrapper.innerHTML = equ.trim();
        editor.insertContent(katex_wrapper.outerHTML);

        const body = editor.dom.getRoot();
        const spans = $$(body).find("span.katex-wrapper.active");
        spans.each(index => {
          const span: HTMLElement = spans[index];
          const equation = span.innerHTML;
          span.innerHTML = katex.renderToString(equation);
          jQuery(span).removeClass("active");
        });
        // f\left(x\right)=\sqrt{2^3}
      }
    });

    // the editor is just a div with focus in
    /* const editor_outer = document.createElement("div");
    const editor_outer_style = {
      border: "1px solid #f3f3f3",
      "min-width": "40%",
      position: "fixed",
      "z-index": "5",
      top: "20px",
      right: "10px",
      padding: "5px",
      background: "white",
      "box-shadow": "1px 0px 4px #969696",
      "max-width": "80%",
      "text-align": "left"
    };
    editor_outer.className = "katex_outer";
    Object.assign(editor_outer.style, editor_outer_style);

    const editor_inner = document.createElement("span");
    const editor_inner_style = {
      width: "100%",
      display: "inline"
    };
    editor_inner.className = "katex_inner";
    Object.assign(editor_inner.style, editor_inner_style);

    editor_outer.appendChild(editor_inner);
    editor.insertContent(editor_outer.outerHTML);
    setCursor(editor, editor_inner, true); */

    // insert_equation(editor_inner);
  };

  /* const enable_katex_editor = (katex_inner?) => {
    // get the actual katex formula
    create_katex_editor();
  }; */

  const disable_katex_editor = () => {
    const body = editor.dom.getRoot();
    const katex_inners = $$(body).find(".katex_inner");
    for (const item of katex_inners) {
      toUnwrappedContent(item, "katex_outer");
    }
  };

  editor.on("NodeChange", on_editor_node_change);
  // editor.off("NodeChange", on_editor_node_change);
};

tinymce.PluginManager.add("latex", setup);

// tslint:disable-next-line:no-empty
export default () => {};
