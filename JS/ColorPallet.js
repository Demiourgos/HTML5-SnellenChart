//These varaibles should be initialised only during page load
var NUMBER_OF_COLORS;
var NUMBER_OF_ROWS = 6;
var NUMBER_OF_COLUMNS = 6;
var CANVAS_HEIGHT;
var CANVAS_WIDTH;

//globale variables
var UniqueColors = {}; //dictionary of unique colors
var ColorPaletteContext; //drawing context of color palette
var ColorPaletteCanvas; //color palette canvas
var ColorPaletteItems = []; //array to store object of each color item drawn inside the canvas
var SelectedForeColorIndex; 
var SelectedBackColorIndex; 
var CurrentSelection; // current color selection
var SelectedProperty; // stores what property is selected by user. {0 : Foreground, 1: Background, -1:no selection}

//call initialize on to load method of body
window.addEventListener("load",InitializeComponent);

function InitializeComponent(){
    ColorPaletteCanvas = document.getElementById("colorPalette");
    
    //initialize global variables
    ColorPaletteContext = ColorPaletteCanvas.getContext("2d");
    CANVAS_HEIGHT = ColorPaletteCanvas.height;
    CANVAS_WIDTH = ColorPaletteCanvas.width;
    NUMBER_OF_COLORS = NUMBER_OF_COLUMNS * NUMBER_OF_ROWS;
    
    //initialize the color dictionary based on the number of colors
    GenerateUniqueColors();
    CreateColorPalette(ColorPaletteContext, CANVAS_WIDTH
    , CANVAS_HEIGHT, NUMBER_OF_ROWS, NUMBER_OF_COLUMNS);
    
    //set default values
    SelectedProperty = -1;
    CurrentSelection = 0;
    SelectedForeColorIndex = 0;
    SelectedBackColorIndex = 1;
    
    //create chart with default of 6 lines
    CreateSnellenChartDivs(6);
    
    var divAlphabets = document.getElementById("divEyeTestingScreen");
    SetFgColor(divAlphabets,ColorPaletteItems[SelectedForeColorIndex].color);
    SetBgColor(divAlphabets,ColorPaletteItems[SelectedBackColorIndex].color);
    
    //event handling for color selection in canvas
    ColorPaletteCanvas.addEventListener("click", HighlightSelectedColor);
    
    //event handling for dropdown selection change
    var propertySelector = document.getElementById("propertySelector");
    propertySelector.addEventListener("change", PropertySelectionChanged);
    
    //event handling for number of line change
    var inputNumberOfLines = document.getElementById("numberOfLines");
    inputNumberOfLines.addEventListener("change", ChangeNumberOfLines);

}

//handles the property dropdown selection change
function PropertySelectionChanged(){
    var divAlphabets = document.getElementById("divEyeTestingScreen");
    SelectedProperty = this.value;
    if(SelectedProperty == 0)
    {
        SetFgColor(divAlphabets,ColorPaletteItems[SelectedForeColorIndex].color);
        HighlightColor(SelectedForeColorIndex);
    }
    else if(SelectedProperty == 1)
    {
        SetBgColor(divAlphabets,ColorPaletteItems[SelectedBackColorIndex].color);
        HighlightColor(SelectedBackColorIndex);
    }
    else
    {
        ColorPaletteItems[CurrentSelection].clearHighlight(ColorPaletteContext);
    }
}

//handles color selection in canvas
function HighlightSelectedColor(e){
    var divAlphabets = document.getElementById("divEyeTestingScreen");
    var x = e.clientX - this.offsetLeft;
    var y = e.clientY - this.offsetTop;
    var selectedColorIndex = GetIndexOfColor(x,y);
    if(SelectedProperty == 0)
    {
        SelectedForeColorIndex = selectedColorIndex;
        SetFgColor(divAlphabets,ColorPaletteItems[SelectedForeColorIndex].color);
    }
    else if(SelectedProperty == 1)
    {
        SelectedBackColorIndex = selectedColorIndex;
        SetBgColor(divAlphabets,ColorPaletteItems[SelectedBackColorIndex].color);
    }
    if(SelectedProperty !== -1)
        HighlightColor(selectedColorIndex);
}

// highlights the element in the color items array for a given index
function HighlightColor(selectedColorIndex){
    ColorPaletteItems[CurrentSelection].clearHighlight(ColorPaletteContext);
    CurrentSelection = selectedColorIndex;
    ColorPaletteItems[CurrentSelection].addHighlight(ColorPaletteContext);
}

//return index of the color item in ColorPaletteItems array based on x and y coordinates within the canvas 
function GetIndexOfColor(x,y){
    var itemHeight = CANVAS_HEIGHT / NUMBER_OF_ROWS;
    var itemWidth = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
    var rowNum = Math.floor(y / itemHeight);
    var columnNum = Math.floor(x / itemWidth);
    return (rowNum * NUMBER_OF_ROWS + columnNum);
}

//creates the collor palettes and draws them on to the canvas
function CreateColorPalette(context, canvasWidth, canvasHeight, noOfRows, noOfColumns){
    var itemCount = 0;
    var itemHeight = 0;
    var itemWidth = 0;
    var row =0; var column =0;
    itemHeight = canvasHeight / noOfRows;
    itemWidth = canvasWidth / noOfColumns;
    
    for(var key in UniqueColors){
        if(itemCount % noOfColumns === 0 && itemCount !== 0){
            column=0;
            row++;
        }
        else if(itemCount !== 0){ column++; }
        ColorPaletteItems[itemCount] 
        = new ColorRect(column * itemWidth, row * itemHeight,itemWidth,itemHeight,UniqueColors[key]);
        ColorPaletteItems[itemCount].draw(context);
        itemCount++;
    }
}

//class for creating object of the rectangle filled with color to be drawn in cavas
function ColorRect(x,y,w,h,color){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.defaultBorderColor = "rgb(255,255,255)";
    this.highlightBorderColor = "rgb(0,0,0)";
    this.draw = function(context){
        DrawRect(this.x ,this.y ,this.w,this.h ,this.color.GetRGBColorString(),context);
        DrawRectangleBorder(this.x,this.y,this.w,this.h,this.defaultBorderColor,2, context);
    };
    this.addHighlight = function(context){
        DrawRectangleBorder(this.x + 1,this.y + 1,this.w - 2,this.h - 2,this.highlightBorderColor,4, context);
    };
    this.clearHighlight = function(context){
        this.draw(context);
    };
}

//function to draw rectangular border based on the the dimensions for a given 2d context
function DrawRectangleBorder(x,y,w,h,color,borderThickness,context){
    context.strokeStyle = color;
    context.lineWidth = borderThickness;
    context.strokeRect(x,y,w,h);
}

//function to draw rectangle based on the the dimensions for a given 2d context
function DrawRect(x,y,w,h,rgbFill,context){
    context.fillStyle = rgbFill;
    context.fillRect(x,y,w,h);
}

//class to store the r,g,b value of color 
function RGBColor(r,g,b){
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.GetRGBColorString = function(){
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    };
    this.GetHashCode = function(){
        return "" + ("00" + this.r).slice(-3) + ("00"+this.g).slice(-3) + ("00" + this.b).slice(-3);
    };
}

//function for generating unique colors
function GenerateUniqueColors(){
    var r = 0; //red
    var g = 0; //green
    var b = 0; //blue
    var count = 2;
    UniqueColors[0] = new RGBColor(255,255,255);
    UniqueColors[1] = new RGBColor(0,0,0);
    while(count < NUMBER_OF_COLORS) {
        r = Math.floor(255 * Math.random());
        g = Math.floor(255 * Math.random());
        b = Math.floor(255 * Math.random());
        var color = new RGBColor(r,g,b);
        if(!(color.GetHashCode() in UniqueColors)){
            UniqueColors[color.GetHashCode()] = color;
        }
        count++;
    }
}


//Creating div and its style

function ChangeNumberOfLines(){
    try{
        var lines = parseInt(this.value,10);
        if(lines > 11 || lines <= 0)
            alert('Invalid Number. Enter value between 1 and 11');
        else  CreateSnellenChartDivs(lines);
    }
    catch(e){
        alert('Invalid Number');
    }
}

//sets foreground color of a given element
function SetFgColor(elem,color){
    elem.style.color = color.GetRGBColorString();
}

//sets background color of a given element
function SetBgColor(elem,color){
    elem.style.backgroundColor = color.GetRGBColorString();
}


//creates the chart
function CreateSnellenChartDivs(lines){
    var divAlphabets = document.getElementById("divEyeTestingScreen");
    while(divAlphabets.firstChild) divAlphabets.removeChild(divAlphabets.firstChild);
    var defaultFontSize = GetDefaultFontSizeInPixel();
    var maxFontSize = CANVAS_HEIGHT / defaultFontSize;
    for(var j= 1; j <= lines; j++){
        var divLine = document.createElement("div");
        
        divLine.className = "line";
        
        //determines the font size of current line
        divLine.style.fontSize = maxFontSize * (lines - j + 1) * 2 / (lines * lines + lines) + "em"; 
        
        divAlphabets.appendChild(divLine);
        
        //create sub divs for every line. number of elements = current line number
        for(var i = 1; i <= j; i++){
            var div = document.createElement("div");
            var text = document.createTextNode(String.fromCharCode(Math.floor(Math.random() * 25) + 65));
            div.appendChild(text);
            divLine.appendChild(div);
        }
    }
}

//function to determine the default font size set in browser
function GetDefaultFontSizeInPixel(){
    var child = document.createElement("div");
    var fontSize = 16; //default font size
    child.style.fontSize = "1em";
    child.appendChild(document.createTextNode("A"));
    document.body.appendChild(child);
     fontSize = child.offsetHeight;
    document.body.removeChild(child);
    return fontSize;
}
