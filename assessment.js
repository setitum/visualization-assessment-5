
const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 850);

const svg2 = d3.select("#treemap-chart")
    .append("svg")
    .attr("viewBox", "0 0 1200 800")
    .attr("width", 1300)
    .attr("height", 800);
 
const margin = { top: 150, right: 50, bottom: 70, left: 100};
const graphWidth = 650;
const graphHeight = 750 - margin.top - margin.bottom;


const graph = svg.append("g")
    .attr("height", graphHeight)
    .attr("width",graphWidth)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const rect = graph.selectAll("rect");

const xAxisGroup = graph.append("g");

const yAxisGroup = graph.append("g");



const mainCanvas = svg.append("g")
    .attr("width", graphWidth / 2)
    .attr("height", graphHeight / 2)
    .attr("transform", `translate(${margin.left + 200}, ${margin.top + 300})`);


const formatComma = d3.format(",");

var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, -3])
    .direction("e")
    .html(function(d) {
        return `${d.name}<br/>Twitter Followers: <span style='color:#29c5f9'>${formatComma(d.twitter_followers)}</span>`;
    });

mainCanvas.call(tip);

const pie = d3.pie()
    .sort(null)
    .value(data => data.twitter_followers);

const arcPath = d3.arc()
    .outerRadius(200)
    .innerRadius(100);

const colorScale = d3.scaleOrdinal(d3.schemeSet3);

svg.append("text")
    .attr("class", "graph-title")
    .attr("dy", "10%")
    .attr("y", "10")
    .attr("x", "210")
    .style("opacity", 0.0)

    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("fill", "black")
    .text("Top Shoe Brands by Twitter Followers");


const barChartColor = {
    "Nike": "red",         
    "Adidas": "blue",         
    "Skechers": "purple",       
    "New Balance": "magenta",    
    "ASICS": "cyan",          
    "Puma": "green",          
    "Under Armour": "yellow",   
    "Fila": "orange",           
    "Columbia": "#3A86FF",       
    "K-Swiss": "brown"         
  };

d3.csv('brands.csv', function(d) {
    return {
        name: d.name,
        twitter_followers: +d.twitter_followers,
    };
}).then(data => {
    console.log(data);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.twitter_followers)])
                .range([graphHeight,0]);

    const x = d3.scaleBand()
                .domain(data.map(d => d.name))
                .range([0, graphWidth])                  
                .padding(0.1);                          

    const bars = graph.selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => x(d.name))
                .attr("y", graphHeight)
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", d => barChartColor[d.name] || "#ccc")
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide);
    bars.transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .delay((d, i) => i * 100)
                .attr("y", d => y(d.twitter_followers))
                .attr("height", d => graphHeight - y(d.twitter_followers));


    xAxisGroup
            .attr("transform", `translate(0, ${graphHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("fill", "black")
            .style("font-weight", "bold");
    yAxisGroup.call(d3.axisLeft(y))
            .attr("transform", `translate(0, 0)`)
            .selectAll("text")
            .style("fill", "black")
            .style("font-weight", "bold");
});

svg2.append("text")
    .attr("class", "graph-title")
    .attr("dy", "10%")
    .attr("y", "0")
    .attr("x", 310)
    .style("opacity", 0.0)
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("fill", "black")
    .text("Market Cap of Top Shoe Brands (In USD)");

d3.csv('brands.csv', function(d) {
    const cap = d.market_cap;
    const numericCap = cap && cap.includes("Billion")
      ? +cap.replace(/[^\d.]/g, "")
      : null;
  
    return {
      name: d.name || "Unknown",
      market_cap: numericCap
    };
  }).then(data => {
    const filteredData = data.filter(d => d.market_cap !== null && !isNaN(d.market_cap));
  
    const root = d3.hierarchy({ children: filteredData })
      .sum(d => d.market_cap)
      .sort((a, b) => b.value - a.value);
  
    const width = +svg2.attr("width");
    const height = +svg2.attr("height");
  
    d3.treemap()
      .size([1100,550])
      .padding(4)(root);
  
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    const treemapGroup = svg2.append("g")
                .attr("transform", `translate(0, ${100})`);;
  
    const nodes = treemapGroup
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
    nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.name))
      .attr("stroke", "#fff");
  
    nodes.append("text")
      .attr("x", 4)
      .attr("y", 14)
      .style("fill", "white")
      .style("font-size", "12px")
      .text(d => `${d.data.name}: $${d.data.market_cap}B`);
  });

  

