let svgWidth = window.innerWidth/1.7;
let svgHeight = window.innerHeight/1.2;

//set borders in svg
let margin = {
    top: 50,
    right: 50,
    bottom: 200,
    left: 80
};

//calculate chart height and width
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

//append a div classed chart to the scatter element
let chart = d3.select("#scatter").append("div").classed("chart", true);

//append an svg element to the chart with appropriate height and width
let svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);


//append an svg group
let chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//initial Parameters
let chartXAxis = "poverty";
let chartYAxis = "healthcare";


// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}
//function used for updating x-scale let upon clicking on axis label
function xScale(censusData, chartXAxis) {
    //create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chartXAxis]) * 0.8,
            d3.max(censusData, d => d[chartXAxis]) * 1.2])
        .range([0, width]);

    return xLinearScale;
}

//function used for updating y-scale let upon clicking on axis label
function yScale(censusData, chartYAxis) {
    //create scales
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chartYAxis]) * 0.8,
            d3.max(censusData, d => d[chartYAxis]) * 1.2])
        .range([height, 0]);

    return yLinearScale;
}

//function used for updating xAxis let upon click on axis label
function renderAxesX(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function used for updating yAxis let upon click on axis label
function renderAxesY(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//function used for updating circles group with a transition to new circles
//for change in x axis or y axis
function renderCircles(circlesGroup, newXScale, chartXAxis, newYScale, chartYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => newXScale(data[chartXAxis]))
        .attr("cy", data => newYScale(data[chartYAxis]));

    return circlesGroup;
}


//function used for updating state labels with a transition to new 
function renderText(textGroup, newXScale, chartXAxis, newYScale, chartYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chartXAxis]))
        .attr("y", d => newYScale(d[chartYAxis]));

    return textGroup;
}
//function to stylize x-axis values for tooltips
function styleX(value, chartXAxis) {

    //stylize based on letiable chosen
    //poverty percentage
    if (chartXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income in dollars
    else if (chartXAxis === 'income') {
        return `$${value}`;
    }
    //age (number)
    else {
        return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(chartXAxis, chartYAxis, circlesGroup) {

    //select x label
    //poverty percentage
    if (chartXAxis === 'poverty') {
        var xLabel = "Poverty:";
    }
    //household income in dollars
    else if (chartXAxis === 'income') {
        var xLabel = "Median Income:";
    }
    //age (number)
    else {
        var xLabel = "Age:";
    }

    //select y label
    //percentage lacking healthcare
    if (chartYAxis === 'healthcare') {
        var yLabel = "No Healthcare:"
    }
    //percentage obese
    else if (chartYAxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking percentage
    else {
        var yLabel = "Smokers:"
    }

    //create tooltip
    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chartXAxis], chartXAxis)}<br>${yLabel} ${d[chartYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    //add events
    circlesGroup.on("mouseover", toolTip.show)
    .on("mouseout", toolTip.hide);

    return circlesGroup;
}


//retrieve csv data and execute everything below
d3.csv("./assets/data/data.csv").then(function(censusData) {

    console.log(censusData);

    //parse data
    censusData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create first linear scales
    let xLinearScale = xScale(censusData, chartXAxis);
    let yLinearScale = yScale(censusData, chartYAxis);

    //create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //append initial circles
    let circle = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chartXAxis]))
        .attr("cy", d => yLinearScale(d[chartYAxis]))
        .attr("r", 14)
        .attr("opacity", ".8");

    //append initial text
    let textGroup = chartGroup.selectAll(".stateText")
        .data(censusData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chartXAxis]))
        .attr("y", d => yLinearScale(d[chartYAxis]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function(d){return d.abbr});

    //create group for 3 x-axis labels
    let xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    let povertyLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    let ageLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)")

    let incomeLabel = xLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Household Income (Median)")

    //create group for 3 y-axis labels
    let yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    let healthcareLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    let smokersLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    let obesityLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obese (%)");

    //updateToolTip function with data
    let circlesGroup = updateToolTip(chartXAxis, chartYAxis, circle);

    //x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            let value = d3.select(this).attr("value");

            //check if value is same as current axis
            if (value != chartXAxis) {

                //replace chartXAxis with value
                chartXAxis = value;

                //update x scale for new data
                xLinearScale = xScale(censusData, chartXAxis);

                //update x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);

                //update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chartXAxis, yLinearScale, chartYAxis);

                //update text with new x values
                textGroup = renderText(textGroup, xLinearScale, chartXAxis, yLinearScale, chartYAxis);

                //update tooltips with new info
                circlesGroup = updateToolTip(chartXAxis, chartYAxis, circlesGroup);

                //change classes to change bold text
                if (chartXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                }
                else if (chartXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                }
                else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    //y axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        //get value of selection
        let value = d3.select(this).attr("value");

        //check if value is same 
        if (value != chartYAxis) {

            //replace value
            chartYAxis = value;

            //update y scale
            yLinearScale = yScale(censusData, chartYAxis);

            //update x axis 
            yAxis = renderAxesY(yLinearScale, yAxis);

          
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chartXAxis, yLinearScale, chartYAxis);

        
            textGroup = renderText(textGroup, xLinearScale, chartXAxis, yLinearScale, chartYAxis)

            //update tooltips with new info
            circlesGroup = updateToolTip(chartXAxis, chartYAxis, circlesGroup);

            //change classes to change bold text
            if (chartYAxis === "obesity") {
                obesityLabel.classed("active", true).classed("inactive", false);
                smokersLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else if (chartYAxis === "smokes") {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokersLabel.classed("active", true).classed("inactive", false);
                healthcareLabel.classed("active", false).classed("inactive", true);
            }
            else {
                obesityLabel.classed("active", false).classed("inactive", true);
                smokersLabel.classed("active", false).classed("inactive", true);
                healthcareLabel.classed("active", true).classed("inactive", false);
            }
        }
    });
});
