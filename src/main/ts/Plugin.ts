declare const tinymce: any;

const setup = (editor, url) => {
  editor.addButton('latex', {
    text: 'latex button',
    icon: false,
    onclick: () => {
      // tslint:disable-next-line:no-console
      editor.setContent('<p>content added from latex</p>');
    }
  });
};

tinymce.PluginManager.add('latex', setup);

// tslint:disable-next-line:no-empty
export default () => {};
