BreakIt
============

BreakIt is a free GNU/GPL game written in HTML5/JavaScript and created for learning purpose. French speaking developpers can get a step by step tutorial here : http://www.insertafter.com/articles-html5_casse_brique.html . English version will come soon.


You can test it on : http://breakit.insertafter.com/index.html

Requirements
-------------
* Modern web browser (Chrome, Firefox ...)
* NodeJS + npm install websocket
* Libs : RequireJS, Commandor, Sounds.

Building
-------------
Web :
```bash
# Requirements
npm install -g requirejs
./libs.sh
# Build
./build.sh
# Dev
./dev.sh
```

Android :
Reach the bin dir
```
cd materials/android/bin
```
Generate the key :
```
keytool -genkey -v -keystore breakit-key.keystore -alias breakit -keyalg RSA -keysize 2048 -validity 10000
```
Build for release :
```
cd ../
ant release
cd bin
```
Sign, then align :
```
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore breakit-key.keystore Breakit-release-unsigned.apk breakit
zipalign -v 4 Breakit-release-unsigned.apk Breakit-release-signed.apk
```
Launching
-------------
```bash
node server.js
```

Testing
-------------
```bash
npm install -g request mocha; mocha tests/*.mocha.js
```

Sounds
-------------
* Iwan Gabovitch - http://qubodup.net/
* Devin Watson - http://opengameart.org/users/dklon
* Brandon Morris - http://opengameart.org/users/dklon
* A.J. Gillespie - http://opengameart.org/users/avgvst

License
-------
Copyright Nicolas Froidure 2013.

Contributors
-------------
* jonathankowalski
* zigrintchou
* nfroidure

Sounds
-------------
* Simon Lacelle : http://www.freesound.org/people/Simon_Lacelle/sounds/37215/ - Creative Commons Atribution Licence
* Davidou : http://www.freesound.org/people/davidou/sounds/88451/ -  Public domain
* Supraliminal : http://www.freesound.org/people/Supraliminal/sounds/77087/ -  Public domain
* Cognito perceptu : http://www.freesound.org/people/cognito%20perceptu/sounds/20352/ -  Public domain
* Itsallhapening : http://www.freesound.org/people/itsallhappening/sounds/48939/ - Creative Commons Atribution Licence
* FreqMan : http://www.freesound.org/people/FreqMan/sounds/43604 - Creative Commons Atribution Licence
* IFartInUrGeneralDirection : http://www.freesound.org/people/IFartInUrGeneralDirection/sounds/46985/ - Creative Commons Atribution Licence
* SpeedY : http://www.freesound.org/people/SpeedY/sounds/3062/ - Public domain

License
-------
This program excluding it's sounds is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
