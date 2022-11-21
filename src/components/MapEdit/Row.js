


import React from "react";
import Pixel from "./Pixel";


import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Box } from "@mui/material";



const Row = ({ rowData, key, mapWidth,currentTile,tileHeight, tileWidth, selectedTile, layerOrder}) => {
   
   let pixels=[]
    for (let i=0; i<mapWidth; i++){
        pixels.push(<Pixel key={i}  currentTile={currentTile} tileHeight={tileHeight} tileWidth={tileWidth}></Pixel>)
    }

    return(
        <Box className="row">
            
            {rowData.map((tile, index) =>{
                return <Pixel key={key + ' ' + index}  tileData = {tile} currentTile={currentTile} 
                tileHeight={tileHeight} tileWidth={tileWidth} selectedTile={selectedTile}
                layerOrder={layerOrder}></Pixel>
            })
            
        }
       
        </Box>
    )
}

export default Row


