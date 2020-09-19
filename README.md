# ecs-162-final# MEMBERS

Eric Zhang

Alyssa Rodriguez

Juan Santillan

# STATE OF OUR FINAL PROJECT

We believe we covered every expected functional, technical, and design specs.

This includes the google login, google map, images stored to ecs162.org, database creation/getting data in as well as database search and display.

We also did our best copying the front end styling and controls to best match the given design layouts. We hope you enjoy.

# THANK YOU

Thank you to the TA who is going to be grading our project. We hope that it meets expectations.

Also, thank you, the other TAs, and the professor for a great quarter.

We hope you all remain stay safe and healthy.

# UCD LOST&FOUND

The name says it all: this web app is going to be UCD's lost and found website.

There is no existing universal L&F location ( virtually nor physically). There are Facebook pages but those are not very efficient.

## FUNCTIONAL SPECS

1.  The splash page will ask users to login to their UCD Google account. When they get to the home page after logging in, there will be two buttons, one for lost items and one for found items.

2.  Let's call people people looking for a lost item "Seekers" (better name than "Losers"). After pushing the lost items button, a Seeker either can search the existing database, or enter a new lost item, with whatever information as can provide available. Menus must include:

date and time they believe they lost the item
kind of item, including an "other" category if nothing fits
text description

3.  To select places they may have lost the item, they can select campus buildings, or just places (like the quad) on a Google map. After clicking on something for which Google returns a name, they can confirm that that is the location they meant. Note: Leaving out the map features will cost you 10%, but if you are just trying to pass it might be a good move. Instead, add another menu item which allows them to enter a building name (from a menu) or other place on campus.

4.  Someone who found an item is a "Finder". A finder also gets to search or enter a new found item. They see a similar set of menus, and map, and they also have the option to upload a picture of the item. They can also specify what they did with the item (turned it into an office, kept it, left it where it was).

5.  If either a Finder or a Seeker chooses to search, they will get a set of menus that allow them to specify place, kind of item, and a time range. Finders will search lost items, and Seekers will search found items. Any search criteria can be left blank. The results comes up as lines of text on the screen, from most recent to oldest. Clicking on a result shows all the data we have on it, clicking again hides the data.

6.  We're not going to implement a mechanism for Seekers to claim found items; that is left for future work. But, if the Finder has turned the item in somewhere, we're done!

# DESIGN SPECS

You can view the design specs, sample screens, and images you need for the project here. (Links to an external site.)

The font is a google font, and the colors are all from the UCD branding.

Sample screens show the tablet view. The mobile is very similar, but smaller, and the desktop is the same as the tablet but with wider margins on either side of the form on all screens except the first two, which have separate desktop versions.

The cover image, lost and found logo, google image, and search icon are all there for your convenience to use in your project.

# TECHNICAL SPECS

1.  You are welcome to continue using sqlite3 as the database, or you can start using MongoDB. Our detailed instructions will assume you are continuing with sqlite3, but we will provide some instruction on using MongoDB as well.

2.  You can use React for the front end if you want, but it is not required.

3.  Users must login with a UC Davis account. We can't check this until after they log in, but you should warn them on the splash page. To check, you'll need to configure Passport to get the email as well a profile information (puzzle: where and how to do this in the login code), and then check it when it comes back (puzzle: where and how to do this?). If the email is not a UC Davis email, bring them back to the login screen with an error message added.

4.  Use the list input element to let a user type into the item category, or building name, if you are using that, and get auto-completion from the menu. The datetime-local input type (Links to an external site.) is one acceptable way to enter the date and time (although it is not supported on some browsers). You can also have two separate fields for date (Links to an external site.) and time (Links to an external site.), this is what is shown in the screen mockups.

5.  We'll provide a demo for getting started with Google Maps soon.

6.  Images should be stored on ecs162.org.

7.  Hand in the project with a Glitch link, as usual. I know this is not everyone's favorite platform, but it really helps us if everything is consistent.
