Making streams with files constructed from memory
----

Got a couple of times a problem of finding out how to construct a stream with files I have in memory ( as in strings ).

The example by itself is not making much sense, but I'm pretty sure there will be use-cases for this in a lot of projects.

###Example :

Let's say we have a `libs` directory with some js libraries.
Also, we have a `versions` directory, which holds different versions of the same module/lib/whatever.

Our target is to be able to make a complete js file for each version, meaning a file that will have all libraries concatenated, followed by the version file.

So if we had `lib1.js`, `lib2.js` and `version.1.js`,`version.2.js`,`version.3.js`, at the end we'd like to have one complete file for each version file.

>`final.version.1.js` ( which is `lib1.js`+`lib2.js`+`version.1.js` )
>
>`final.version.2.js` ( which is `lib1.js`+`lib2.js`+`version.2.js` )
>
>`final.version.3.js` ( which is `lib1.js`+`lib2.js`+`version.3.js` )
