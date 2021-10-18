import $ from 'jquery';
import foo from './foo.js';

export default function () {
    console.log($('body').height(), foo);
};