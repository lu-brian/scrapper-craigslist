// import { ApartmentAttributes } from './models';

window.onload = () => {
    document.write('<h1>hello</h1>')
}

// class Greeter {
//     element: HTMLElement;
//     span: HTMLElement;
//     timerToken: NodeJS.Timer;

//     constructor(element: HTMLElement) {
//         this.element = element;
//         this.element.innerHTML += "The time is: ";
//         this.span = document.createElement('span');
//         this.element.appendChild(this.span);
//         this.span.innerText = new Date().toUTCString();
//         this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
//     }

//     start() {
//         this.timerToken
//     }

//     stop() {
//         clearTimeout(this.timerToken);
//     }

// }

// window.onload = () => {
//     const el = document.getElementById('content') ?
//     document.getElementById('content') : document.write('hello');

//     const num = [1, 2, 3,4]
//     for (const i of num) {
//         document.write('<h1>hello</h1>')
//     }
//     const greeter = new Greeter(el);
//     greeter.start();
// }