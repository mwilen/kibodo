// Import stylesheets
import './style.css';

enum MetaKeys {

}

class ShortcutManager {
    static shortcuts: IShortcut[] = [];

    static isOsX = navigator.userAgent.includes('Mac OS X');

    private currentScope = 'global';

    // Defining all keys
    private modifiers = ['shiftKey', 'ctrlKey', 'altKey', 'metaKey'];

    private modifierKeys = {
        'shift': 'shift',
        'ctrl': 'ctrl', 'control': 'ctrl',
        'alt': 'alt', 'option': 'alt',
        'win': 'meta', 'cmd': 'meta', 'super': 'meta',
        'meta': 'meta'
    };

    private keys = {
        'backspace': 8,
        'tab': 9,
        'enter': 13, 'return': 13,
        'pause': 19,
        'caps': 20, 'capslock': 20,
        'escape': 27, 'esc': 27,
        'space': 32,
        'pgup': 33, 'pageup': 33,
        'pgdown': 34, 'pagedown': 34,
        'end': 35,
        'home': 36,
        'ins': 45, 'insert': 45,
        'del': 46, 'delete': 46,

        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,

        '*': 106,
        '+': 107, 'plus': 107,
        'minus': 109,
        ';': 186,
        '=': 187,
        ',': 188,
        '-': 189,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        '\'': 222
    };

    currentModifier: string[] = [];
    currentSequence = [];

    clearTimeout: any;

    private listeners: { command: string, callback: () => void }[] = [];

    constructor(){

        // numpad
        for (let i = 0; i < 10; i++) {
            this.keys['num-' + i] = i + 95;
        }
        // top row 0-9
        for (let i = 0; i < 10; i++) {
            this.keys['' + i] = i + 48;
        }
        // f1-f24
        for (let i = 1; i < 25; i++) {
            this.keys['f' + i] = i + 111;
        }
        // alphabet
        for (let i = 65; i < 91; i++) {
            this.keys[String.fromCharCode(i).toLowerCase()] = i;
        }

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousedown', this.onMouseDown);

        document.addEventListener('visibilitychange', () => {
            //Clear sequence when tab is inactive/active
            this.currentSequence = [];
            this.currentModifier = [];
        });
    }

    add(config: IShortcut[]): void{
        ShortcutManager.shortcuts.push(...config);
        console.log(ShortcutManager.shortcuts, config)
    }

    onKeyDown = (event: KeyboardEvent): void => {
        const key = event.key.toLowerCase();
        if(this.modifierKeys[key] && this.currentModifier.indexOf(key) === -1){
          this.currentModifier.push(this.modifierKeys[key]);
        }
        else {
          this.currentSequence.push(key);
        }

        if(event.shiftKey){
          this.setModifier('shift');
        }

        if(event.ctrlKey){
          this.setModifier('ctrl');
        }

        if(event.metaKey){
          this.setModifier('meta');
        }

        if(event.altKey){
          event.preventDefault()
          this.setModifier('alt');
        }


        // console.log(this.currentModifier, this.currentSequence)

        this.checkShorcuts();        
    }

    onKeyUp = (event: KeyboardEvent): void =>{
        const key = event.key.toLowerCase();
        if(this.modifierKeys[key]){
          const i = this.currentModifier.indexOf(this.modifierKeys[key]);
          this.currentModifier.splice(i, 1);
        }

        if(this.clearTimeout){
          window.clearTimeout(this.clearTimeout);
        }
        this.clearTimeout = setTimeout(() => {
          this.currentSequence = [];
          this.currentModifier = [];
        }, 500);
    }

    onMouseDown = (event: MouseEvent): void => {

    }

    setModifier(modifier: Modifier){
      if(!this.currentModifier.includes(modifier)){
        this.currentModifier.push(modifier);
      }
    }

    checkShorcuts(){
        // console.log(this.currentModifier, this.currentSequence)
      for(const shortcut of ShortcutManager.shortcuts){
        console.log(shortcut.key, this.currentModifier, this.currentSequence)
          if(this.currentScope !== shortcut.when){
            continue;
          }
          if(Array.isArray(shortcut.key)){
            const modifiers = shortcut.key.join().match(/(shift|meta|ctrl|alt)/g);
            const keys = shortcut.key
              .map(key => this.keyWithoutModifiers(key))
            if(modifiers.every((key) => this.currentModifier.includes(key)) && keys.every((key) => this.currentSequence.includes(key))){
              console.log('yay')
              for(const listener of this.listeners) {
                listener.callback();
              }
            }
          }
          else if(this.currentSequence.includes(shortcut.key)){
            console.log('yay')
          }
      }
    }

    keyWithoutModifiers(key: string): string {
      const re = new RegExp('(' + this.currentModifier.join('\\+|') + '\\+)', 'g');
      return key.replace(re, '');
    }

    setScope(scope: string): void {
      this.currentScope = scope;
    }

    listen(command: string, callback: () => void): void {
      this.listeners.push({
        command,
        callback
      })
    }

    destroy(){
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keydown', this.onKeyUp);
        window.removeEventListener('keydown', this.onMouseDown);
        this.listeners = [];
    }
}

interface IShortcut {
    key: string | string[];
    command: string;
    when: string;
    options?: [];
}

interface ShortcutOptions {
    preventDefault?: boolean;
}

type Modifier = 'meta' | 'ctrl' | 'shift' | 'alt';

const shortcutManager = new ShortcutManager();

shortcutManager.add(
  [
    {
      key: ['ctrl+shift+v'],
      command: 'asd',
      when: 'global'
    },
    {
      key: 'a',
      command: 'asd',
      when: 'global'
    }
  ]
)

shortcutManager.listen('asd', () => {
  console.log('hello')
})