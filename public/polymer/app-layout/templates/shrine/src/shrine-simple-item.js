/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
import {Polymer} from '/polymer/polymer/lib/legacy/polymer-fn.js';

import {html} from '/polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
    <style>

      :host {
        @apply --layout-horizontal;
        @apply --layout-center-center;
        @apply --layout-wrap;
        position: relative;
        text-align: center;
        width: 100%;
        height: 100%;
        --paper-icon-button-ink-color: #31f0ef;
      }

      .pic {
        width: 80%;
        height: 80%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        transition: opacity 0.5s;
      }

      :host::after {
        content: "";
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity 0.5s;
        pointer-events: none;
        /* create a layer to only invalidate this layer for :hover */
        transform: translateZ(0);
      }

      :host:hover::after {
        opacity: 1;
      }

    </style>

    <div class="pic" style\$="background-image: url([[item.imageUrl]]);"></div>
`,

  is: 'shrine-simple-item',

  properties: {

    item: {type: Object}

  }
});
