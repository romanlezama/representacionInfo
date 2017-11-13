function fnGraphCirculo( data ){




  var w = 1280,
      h = 800,
      r = 650,
      x = d3.scale.linear().range([0, r]),
      y = d3.scale.linear().range([0, r]),
      node,
      root;

  var pack = d3.layout.pack()
      .size([r, r])
      .value(function(d) { return d.size; })

  var vis = d3.select("body").insert("svg:svg", "h2")
      .attr("width", "100%")
      .attr("height", "100%")
    .append("svg:g")
      .attr("transform", "translate(0,0)");





  node = root = data;

  var nodes = pack.nodes(root);

  console.log(nodes);

  vis.selectAll("circle")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .on("click", function(d) { return zoom(node == d ? root : d); });

  var textEnter = vis.selectAll("text")
      .data(nodes)
    .enter().append("svg:text")
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("opacity", function(d) { return d.r > 20 ? 1 : 0; });
      //.text(function(d) { return d.name + ' ' +d.size+' Delitos'; });

  textEnter.append("tspan")
      .attr("x", function(d) { return d.x; })
      .text(function(d) { 
        return d.name;
      });
  textEnter.append("tspan")
      .attr("x", function(d) { return d.x; })
      .attr("dy", "1.5em")
      .text(function(d) { 
        return d.size + ' Delitos';
      });

  d3.select(window).on("click", function() { zoom(root); });



  function zoom(d, i) {
    var k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("r", function(d) { return k * d.r; });

    t.selectAll("tspan")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

    node = d;
    d3.event.stopPropagation();
  }



}

function fnGraficar(){
  fnGraphCirculo( fnGeneraJsonDesdeTabla() );
}