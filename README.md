sigmajs.org - v1.0.2
====================

Here is sigma.js' website. The `master` branch presents the resources to build the website, and the `gh-pages` branch contains the built files.

The website has been designed by [Daniele](https://github.com/danieleguido), who also implemented it with the help of [Alexis](https://github.com/jacomyal/).


### Build

The website is based on [Assemble](http://assemble.io/). Be sure to have [NPM](http://npmjs.org) and [Grunt](http://gruntjs.com) installed before continuing.

First clone the repository:

````
git clone git@github.com:jacomyal/sigmajs.org
cd sigmajs.org
````

Then, install the dependencies:

````
npm install
````

Finally, run the Grunt tasks:

````
grunt
````

At this point, the built website is available in the `dist` repository, with pages and built assets. Then, you just need to copy the `dist` folder content to the root of the `gh-pages` branch.
