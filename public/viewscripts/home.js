 // 예시 데이터
 var data = [4, 8, 15, 16, 23, 42];
 var pieData = [1, 2, 3, 4, 5];


 
// 예시 데이터
var data = [4, 8, 15, 16, 23, 42];

// 막대 그래프 생성
var width = 420, barWidth = 20;

// 막대 그래프 높이 정의
var height = 200;  // 이 값을 적절하게 설정하세요

var y = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([height, 0]);

var chart = d3.select("#bar-chart")
    .attr("width", barWidth * data.length)
    .attr("height", height);

var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + i * barWidth + ", 0)"; });

bar.append("rect")
    .attr("y", function(d) { return y(d); })
    .attr("height", function(d) { return height - y(d); })
    .attr("width", barWidth - 1);

bar.append("text")
    .attr("x", barWidth / 2)
    .attr("y", function(d) { return y(d) + 3; })
    .attr("dy", ".75em")
    .text(function(d) { return d; });








// 원형 그래프 생성
var width = 200, // CSS의 max-width와 일치
    height = 200, // 원형 그래프의 높이를 가로 크기에 맞춤
    radius = Math.min(width, height) / 2;

var color = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

// 여기서 'append("svg")' 부분을 제거하고 기존의 SVG 요소를 사용
var svg = d3.select("#pie-chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var g = svg.selectAll(".arc")
    .data(pie(pieData))
    .enter().append("g")
    .attr("class", "arc");

g.append("path")
    .attr("d", arc)
    .style("fill", function(d) { return color(d.data); });

g.append("text")
    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.data; });