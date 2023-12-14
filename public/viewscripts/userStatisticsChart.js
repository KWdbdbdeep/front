d3.json('/api/user-statistics').then(function(data) {
    // 데이터 전처리: "가입 수" 필드의 공백 제거 및 숫자로 변환
    console.log(data);
    // 문자열에서 콤마와 공백을 제거하고 숫자로 변환합니다.
    data.forEach(d => {
        d.count = parseInt(d["가입 수"].replace(/,/g, '').trim(), 10);
    });

    // 연령대별로 데이터 집계 및 "가입 수" 합산
    var ageData = Array.from(d3.rollup(data,
        v => d3.sum(v, d => d.count), // "가입 수"를 합산
        d => d.연령대코드 // "연령대코드"를 기준으로 그룹화
    )).map(([key, value]) => ({ key, value }));

    // 성별 별로 데이터 집계 및 "가입 수" 합산
    var genderData = Array.from(d3.rollup(data,
        v => d3.sum(v, d => d.count), // "가입 수"를 합산
        d => d.성별 // "성별"을 기준으로 그룹화
    )).map(([key, value]) => ({ key, value }));

    // 원형 그래프의 크기와 반지름 설정
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;

    // 원형 그래프의 컨테이너 SVG 요소 생성
    var svg = d3.select('#gender-pie-chart') // 원형 그래프를 위한 컨테이너의 ID
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // 원형 그래프의 색상 스케일 설정
    var color = d3.scaleOrdinal()
        .domain(genderData.map(function(d) { return d.key; }))
        .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56']); // 색상 범위 설정

    // 원형 그래프의 arc 생성기 설정
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // 원형 그래프의 레이블 위치를 위한 arc 생성기 설정
    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    // 원형 그래프 데이터 설정
    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.value; })(genderData);

    // 원형 그래프의 각 부분을 그리기
    var g = svg.selectAll('.arc')
        .data(pie)
      .enter().append('g')
        .attr('class', 'arc');

    g.append('path')
        .attr('d', arc)
        .style('fill', function(d) { return color(d.data.key); });

    // 원형 그래프의 각 부분에 레이블 추가
    g.append('text')
        .attr('transform', function(d) { return 'translate(' + labelArc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .text(function(d) { return d.data.key; });

    // SVG 요소 설정
    var svg = d3.select("#age-bar-chart"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // 스케일 설정
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(ageData.map(function(d) { return d.key; }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(ageData, function(d) { return d.value; })]);

    // 그래프 바 그룹
    var barG = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 막대 생성
    barG.selectAll(".bar")
        .data(ageData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "steelblue"); // 막대 색상 지정

    // x축 생성
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(d3.axisBottom(x));

    // y축 생성
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(y));
});
