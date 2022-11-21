import React from "react";

import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Toolbar,Box } from "@mui/material";
import ToolbarLeft from "./ToolBarLeft"
import ToolbarRight from "./ToolbarRight"
import MapGrid from "./MapGrid";
import { useState } from "react";
import { EditMap_Transaction } from "../../static/Transaction";
//import TS from "/sampletspub.png"


const MapEditor = (props) => {
    const [mapWidth, setMapWidth]=useState(5)
    const [mapHeight, setMapHeight]=useState(5)
    const[currentTile,setCurrentTile]=useState("")
    const [tileWidth, setTileWidth]=useState(40)
    const [tileHeight, setTileHeight]=useState(40)
    const [GIDTable, setTable] = useState([]);

    const createDataMap = () => {
        let datamap = [];
        for(let i = 0; i < mapHeight; i++){
            let row = []
            for(let j = 0; j < mapWidth; j++){
                let grid_obj = {layers: []};
                row.push(grid_obj);
            }
            datamap.push(row);
        }
        return datamap;
    }

    const [dataMap, editMap] = useState(createDataMap());
    const [selectedTile, changeSelect] = useState({gid: -1, dataURL: ""});
    const [layerOrder, editOrder] = useState(["Mountain"]);
    
    const setErase = (newState) => {
        if(newState){
            console.log("Changing to empty");
            changeSelect({gid: 0, dataURL: ""});
        }
        else{
            changeSelect({gid: -1, dataURL: ""});
        }
    } 

    const grid_generator = (width, height, tile_width, tile_height) => {
        let rows = [];
        for(let i = 0; i + tile_height < height; i = i + tile_height){
          let new_row = [];
          for(let j = 0; j + tile_width < width; j = j + tile_width){
            let canvas_prop = {sx: j, sy: i, swidth: tile_width, sheight: tile_height, x: 0, y: 0, width: tile_width, height: tile_height};
            new_row.push(canvas_prop); 
          }
          rows.push(new_row);
        }
        return rows;
      }

    const createGIDTableElement = (grid_prop, img) => {
        let c = document.createElement('canvas');
        let ctx = c.getContext("2d");
        ctx.drawImage(img, grid_prop.sx, grid_prop.sy, 
            grid_prop.swidth, grid_prop.sheight, grid_prop.x, grid_prop.y, grid_prop.width, grid_prop.height);
        let dataURL =  c.toDataURL();
        return dataURL;
    }

    const loadTS = (start, img) => {
        let grid_props = grid_generator(550, 200, 40, 40); //todo: hardcoded, make dynamic
        let GIDTable = [];
        let gid = start;
        for(let grid_row = 0; grid_row < grid_props.length; grid_row = grid_row + 1){
            for(let grid_col = 0; grid_col < grid_props[grid_row].length; grid_col = grid_col + 1){
                GIDTable.push(
                    {gid: gid, data: createGIDTableElement(grid_props[grid_row][grid_col], img)}
                );
                gid = gid + 1;
            }
        }
        console.log("table", GIDTable);
        return GIDTable;
    }

    /**
     * Used for creating a map edit transaction
     */
    const editDataMap = (previousPixelState, updatedPixelState) => {
        let targetRow = previousPixelState.row;
        let targetCol = previousPixelState.col;
        console.log("ROW: " + targetRow);
        console.log("COLUMN: " + targetCol);

        let previousDataMap = dataMap;
        console.log("PREV: ", previousDataMap);
        let clonedDataMap = JSON.parse(JSON.stringify(dataMap)); //create deep copy of dataMap
        console.log("NEW: ", clonedDataMap);
        clonedDataMap[targetRow][targetCol] = updatedPixelState.layers; //update the copy with the new pixel data

        let newMapEditTransaction = new EditMap_Transaction(previousDataMap, clonedDataMap, editMap);
        props.transactionStack.addTransaction(newMapEditTransaction);

        console.log("Added map edit transaction to TPS");
    }

    //let GIDTable = loadTS(1);

    React.useEffect(() => {
        function loadImage(url) {
            return new Promise((fulfill, reject) => {
              let imageObj = new Image();
              imageObj.onload = () => fulfill(imageObj);
              imageObj.setAttribute('crossOrigin', 'anonymous');
              imageObj.src = url;
            });
          }

        async function getTable() {
            let table = await 
            loadImage('https://res.cloudinary.com/dle4whfjo/image/upload/v1668890339/VIP_SBU_MAPS_Tileset_2_zuvpi1.png')
                .then((image) => loadTS(1, image));
            setTable((oldarray => [... table]));
        }
        console.log("before");
        getTable();
        

    }, [GIDTable.length == 0])


    return (
        <>
        <Box sx={{ display: 'flex' }}>
        <Grid container 
        direction='row'
        >
        <Grid item  md={2}>
        <ToolbarLeft transactionStack = {props.transactionStack} mapHeight={mapHeight} mapWidth={mapWidth} setMapHeight={setMapHeight} setMapWidth={setMapWidth} tileHeight={tileHeight} tileWidth={tileWidth} setTileHeight={setTileHeight} setTileWidth={setTileWidth}  ></ToolbarLeft>
        </Grid>
        <Grid item  md={8} >
       <MapGrid dataMap={dataMap} mapHeight={mapHeight} mapWidth={mapWidth} setMapHeight={setMapHeight} 
       setMapWidth={setMapWidth} tileHeight={tileHeight} tileWidth={tileWidth}  currentTile={currentTile}  
       selectedTile ={selectedTile} layerOrder={layerOrder} transactionStack = {props.transactionStack} editDataMap = {editDataMap}/>
        </Grid>

        <Grid item  md={2}>

        <ToolbarRight tiles = {GIDTable} select ={(tile) => {
            changeSelect(tile);
        }} setErase={setErase}></ToolbarRight>

        </Grid>
        </Grid>
        </Box>
        </>
    )
}

export default MapEditor


