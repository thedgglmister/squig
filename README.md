# Squig
A random squiggly line generator built using only simple jQuery animations.
Can be found at <a href="http://www.digglemister.com">www.digglemister.com</a>

### --Project Description--

A random squiggly line is an instance of the squig class, which is initiated with parameters to control the behavior of the squiggle. A sequence of movements is generated using these parameters and the Math.random() function. 

Based on this sequence of movements and other calculations, hundreds of transparent divs are appended to the DOM at precise locations and are animated in sequence so that their borders create the effect of a single line squigging across the screen.

Each squig can also follow a specific path consisting of a sequence of user-chosen points. Movements are still randomly generated, but if the squig moves too far off course, a corrective movement will be added to the sequence.

#### --Parameters--

The user can customize his/her squig by specifying the:

    -Length
    -Width
    -Color
    -Start position
    -Animation speed
    
Additionally, random behavior can be controled by specifying ranges for

    -Radius of each turn
    -Degrees of each turn
    -Longest distance a squig can travel without turning

<img src="/images/squig1.png" width="800">
<img src="/images/squig2.png" width="800">
<img src="/images/squig3.png" width="800">
