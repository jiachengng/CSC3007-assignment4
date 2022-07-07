let width = 800, height = 800;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

Promise.all([d3.json("links-sample.json"), d3.json("cases-sample.json")]).then(data => {

    data[0].forEach(e => {
        e.source = e.infector;
        e.target = e.infectee;
    });

    let colorScale = d3.scaleOrdinal()
        .domain([0, 1])
        .range(["steelblue", "pink"]);

    let linkpath = svg.append("g")
        .attr("id", "links")
        .selectAll("path")
        .data(data[0])
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("marker-end", "url(#end)");;

    let node = svg.append("g")
        .attr("id", "nodes")
        .selectAll("circle")
        .data(data[1])
        .enter()
        .append("circle")
        .attr("r", 10)
        .style("fill", d => { if (d.gender == 'male') { return colorScale(0) } else { return colorScale(1) } })
        .style("stroke", "black").style("stroke-width", 1)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragend))
        .on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("AGE: " + d.age + "<br>Gender: " + d.gender.charAt(0).toUpperCase() + "<br>Nationality: " + d.nationality.toUpperCase() + "<br>Occupation: " + d.occupation.toUpperCase() + "<br>Serology: " + d.serology.toUpperCase() + "<br>Organisation: " + d.organization.toUpperCase() + "<br>Vaccinated: " + d.vaccinated.toUpperCase())
                .style("position", "absolute")
                .style("background", "#fff")
                .style("font-size", "20px")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("border", "solid")
                .style("border-width", "3px")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("opacity", 1);

            let path = d3.select(event.currentTarget)
            path.style("stroke", "red").style("stroke-width", 2.5);
        })
        .on("mouseout", (event, d) => {
            d3.select(".tooltip")
                .text("")
                .style("opacity", 0);

            let path = d3.select(event.currentTarget)
            path.style("stroke", "black").style("stroke-width", 1);
        });

    
    // Design arrow pointing head
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])    
        .enter().append("svg:marker")  
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 29)
        .attr("refY", 0.5)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    let xPosition = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range([150, 400, 650]);

    let simulation = d3.forceSimulation()
        .nodes(data[1])
        .force("x", d3.forceX().strength(0.5).x(d => xPosition(d.class)))
        .force("y", d3.forceY().strength(0.01).y(height / 2))
        .force("link", d3.forceLink(data[0])
            .id(d => d.id)
            .distance(50)
            .strength(0.5))
        .force("charge", d3.forceManyBody().strength(-15)) 
        .force("collide", d3.forceCollide().strength(0.1).radius(15))
        .on("tick", d => {
                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })


            linkpath
                .attr("d", d => "M" + d.source.x + "," + d.source.y + " " + d.target.x + "," + d.target.y);

            image
                .attr("x", d => d.x - 7.5)
                .attr("y", d => d.y - 7.5);
        });

    

    let vaccinationScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range([100, 300, 600]);

    var i = 0
    data[1].forEach(d => {
        if (i < 10) {
            d.class = 0
        } else {
            d.class = 1
        }
        i++
    })

    d3.select("#button1").on("click", function () {
        simulation
            .nodes(data[1])
            .force("x", d3.forceX().strength(0.5).x(d => vaccinationScale(d.vaccinated)))
            .force("y", d3.forceY().strength(0.1).y(100))
            .alphaTarget(0.3)
            .restart();
    })

    // Drag methods (drag start, dragged, dragend)
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragend(event, d) {
        d.fx = null;
        d.fy = null;
    }

})