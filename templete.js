// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 20, bottom: 60, left: 60};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    const groups = Array.from(new Set(data.map(d => d.AgeGroup)));
    const xScale = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.2);

    const yExtent = d3.extent(data, d => d.Likes);
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(1000, yExtent[1])]).nice()
        .range([height, 0]);


    // Add scales     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
      .selectAll("text")
        .attr("dy", "1.2em")
        .attr("font-size", 12);

    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text("Age Group");


    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Likes");



    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        return {min, q1};
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

      
    
        // Draw vertical lines
        

        // Draw box
        

        // Draw median line
        
    });

    const byGroup = d3.rollup(data, v => {
        const likes = v.map(d => d.Likes).sort(d3.ascending);
        const q1 = d3.quantile(likes, 0.25);
        const median = d3.quantile(likes, 0.5);
        const q3 = d3.quantile(likes, 0.75);
        const min = d3.min(likes);
        const max = d3.max(likes);
        return {q1, median, q3, min, max};
    }, d => d.AgeGroup);

    const boxWidth = xScale.bandwidth();

    for (const [age, stats] of byGroup.entries()) {
      const x = xScale(age);
      // whisker
      svg.append("line")
        .attr("x1", x + boxWidth/2).attr("x2", x + boxWidth/2)
        .attr("y1", yScale(stats.min)).attr("y2", yScale(stats.max))
        .attr("stroke", "#333");

      // box
      svg.append("rect")
        .attr("x", x)
        .attr("y", yScale(stats.q3))
        .attr("width", boxWidth)
        .attr("height", yScale(stats.q1) - yScale(stats.q3))
        .attr("fill", "#c6dbef")
        .attr("stroke", "#3182bd");

      // median
      svg.append("line")
        .attr("x1", x).attr("x2", x + boxWidth)
        .attr("y1", yScale(stats.median)).attr("y2", yScale(stats.median))
        .attr("stroke", "#08519c").attr("stroke-width", 2);

      // whisker tips
      svg.append("line")
        .attr("x1", x + boxWidth*0.2).attr("x2", x + boxWidth*0.8)
        .attr("y1", yScale(stats.min)).attr("y2", yScale(stats.min))
        .attr("stroke", "#333");
      svg.append("line")
        .attr("x1", x + boxWidth*0.2).attr("x2", x + boxWidth*0.8)
        .attr("y1", yScale(stats.max)).attr("y2", yScale(stats.max))
        .attr("stroke", "#333");
    }
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv", d => ({
  Platform: (d.Platform || "").trim(),
  PostType: (d.PostType || "").trim(),
  AvgLikes: +d.AvgLikes
}));

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => d.AvgLikes = +d.AvgLikes);



    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 160, bottom: 60, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type
    const platforms = Array.from(new Set(data.map(d => d.Platform)));
    const postTypes = Array.from(new Set(data.map(d => d.PostType)));

    const x0 = d3.scaleBand()
        .domain(platforms)
        .range([0, width])
        .paddingInner(0.2);
      

    const x1 = d3.scaleBand()
        .domain(postTypes)
        .range([0, x0.bandwidth()])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
        .range([height, 0]);
      

    const color = d3.scaleOrdinal()
      .domain(postTypes)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g").call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Likes");


  // Group container for bars
    const barGroups = svg.selectAll(".group")
  .data(platforms)
  .enter().append("g")
    .attr("class", "group")
    .attr("transform", d => `translate(${x0(d)},0)`);

  // Draw bars
    barGroups.selectAll("rect")
  .data(p => 
    postTypes.map(t => {
      const row = data.find(d => d.Platform === p && d.PostType === t);
      return {
        Platform: p,
        PostType: t,
        AvgLikes: row ? row.AvgLikes : 0
      };
    })
  )
  .enter().append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));



    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${height / 3})`);

    const types2 = [...new Set(data.map(d => d.PostType))];
    
 
    postTypes.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
  
    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(type));

    legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(type)
        .attr("alignment-baseline", "middle");
    });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => d.AvgLikes = +d.AvgLikes);


    // Define the dimensions and margins for the SVG
    const margin = {top: 30, right: 20, bottom: 70, left: 60};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;


    // Create the SVG container
    const svg = d3.select("#lineplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes  
    const dates = data.map(d => d.Date);
    const x = d3.scalePoint()
        .domain(dates)
        .range([0, width])
        .padding(0.5);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
        .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(30)")
        .attr("text-anchor", "start");

    svg.append("g").call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + 55)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
     svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#1f77b4")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
          .attr("cx", d => x(d.Date))
          .attr("cy", d => y(d.AvgLikes))
          .attr("r", 3.5)
          .attr("fill", "#1f77b4");
});
