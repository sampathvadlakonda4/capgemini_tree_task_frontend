<script setup>
import * as d3 from "d3";
import { onMounted, ref, nextTick } from 'vue';
import { fetchData } from '../services/services'
const svgContainer = ref(null);
const data = ref([])
const activeNode = ref(null)
const rectWidth = ref(100);
const rectheight = ref(80);
const loadingData = ref(false);
let svg = null;
let xPosition = 50;
let yPosition = 50;
let horizontalSpace = 30;
let verticalSpace = 30;
function removeActiveClasses() {
    d3.selectAll('.active').classed('active', false);
    activeNode.value = null;
}
const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y);
function addLinePlot(lineData, group) {
    group.append('path')
        .attr("d", lineGenerator(lineData))
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
}
function createRect(obj, initial, xPos, yPos) {
    let xValue = xPos;
    let yValue = yPos;
    let group = svg.append('g').attr("transform", `translate(${xValue},${yValue})`);
    group.append('rect')
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", rectWidth.value)
        .attr("height", rectheight.value)
        .attr('fill', 'white')
        .attr('class', 'curvedRect')
        .style('cursor', 'pointer')
        .on('click', function (d) {
            removeActiveClasses()
            this.classList.add('active')
            activeNode.value = obj;
        });
    group.append('text')
        .attr("x", (rectWidth.value / 2) - 10)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr('fill', 'black')
        .text(obj.name);

    let nodes = data.value.filter(nodeData => nodeData.parent === obj.name);
    if (nodes.length) {
        // creating half line to right side to the current rect
        let lineData = [
            { x: rectWidth.value, y: rectheight.value / 2 },
            { x: rectWidth.value + (horizontalSpace / 2), y: rectheight.value / 2 }
        ]
        addLinePlot(lineData, group)

        xValue += rectWidth.value + horizontalSpace;
        createNodes(nodes, false, xValue, yPos)
    }


    if (!initial) {  // horizontal small line to the left
        let lineData = [
            { x: 0, y: rectheight.value / 2 },
            { x: 0 - (horizontalSpace / 2), y: rectheight.value / 2 }
        ]
        addLinePlot(lineData, group)
    }

}
function createNodes(list, initial = false, xPos, yPos) {
    let xValue = xPos;
    let up = true;
    let verticalLineData = [];
    list.forEach((each, i) => {
        let yValue = yPos;
        if (i > 0) { // setting y-position 
            if (up) {
                yValue -= ((rectheight.value * i) + verticalSpace)
                up = false
            }
            else {
                yValue += ((rectheight.value + verticalSpace) * (i/2))
                up = true;
            }
        }
        if (!initial) {  // vertical line
            if (list.length - 2 === i || list.length - 1 === i) {
                verticalLineData.push({ x: xValue - (verticalSpace / 2), y: yValue + (rectheight.value / 2) })
            }
            if (list.length - 1 === i) {
                let g = svg.append('g')
                addLinePlot(verticalLineData, g)
            }
        }

        createRect(each, initial, xValue, yValue)
        // setOrResetYPositiontoMiddle();
    })
}
function setOrResetYPositiontoMiddle() {
    yPosition = (svgContainer.value.getBoundingClientRect().height) / 2 - (rectheight.value / 2)
}
onMounted(async () => {
    if (svgContainer.value) {
        loadingData.value = true;
        data.value = await fetchData();
        loadingData.value = false;
        svg = d3.select(svgContainer.value)
            .append('svg').attr('width', '100%').attr('height', '100%');
        setOrResetYPositiontoMiddle();
        // first level
        if(data.value){
            let intialData = data.value?.filter(each => !each.parent)
            createNodes(intialData, true, xPosition, yPosition)
        }
    }
})
</script>
<template>
    <section class="container">
        <div v-show="!data?.length && !loadingData" class="noRecords"> No records found </div>
        <div v-if="activeNode" class="activeNodeContainer">
            <button class="removeButton" @click="removeActiveClasses">X</button>
            <strong>{{ activeNode?.name }}</strong>
            <p>{{ activeNode?.description }}</p>
        </div>
        <div class="svgContainer" ref="svgContainer">
            <div v-if="loadingData" class="loadingData"> Loading... </div>
        </div>
    </section>
</template>
<style scoped>
.container {
    padding: 10px;
    display: flex;
    place-items: center;
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    flex-direction: column;
    position: relative;
}

.activeNodeContainer {
    position: absolute;
    background-color: grey;
    padding: 5px;
}

.svgContainer {
    width: 100%;
    height: calc(100% - 100px);
}

.removeButton {
    background-color: red;
    color: white;
    width: 20px;
    height: 20px;
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    border: 1px solid;
    border-radius: 2px;
    cursor: pointer;
}
.noRecords{
    color: red;
}
.loadingData{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
