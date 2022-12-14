import React from "react";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { Toolbar,Box, Button } from "@mui/material";
import ToolbarLeft from "./ToolBarLeft"
import ToolbarRight from "./ToolbarRight"
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import Modal from '@mui/material/Modal';
import { TOGGLE_LOCK } from '../../graphql/mutations/locking';
import ReactRouterPrompt from "react-router-prompt";
import { useMutation, useQuery } from '@apollo/client';
import JSONSaveModal from "./JSONSaveModal";
import Cookies from 'universal-cookie';
import {useLocation} from 'react-router-dom';
import {uploadImageToCloudinaryAPIMethod} from "../../client";

import { loadTSMapEditor } from '../helpful_functions/helpful_function_ME';

import PNGModal from "./ImportPNG";
import { GET_MAP, GET_TILESETS } from "../../graphql/queries/mapEditorQueries";
import { UPDATE_MAP } from "../../graphql/mutations/mapEditorMutations";
import { ADD_COLLABORATOR_MAP } from "../../graphql/queries/collaboratorQueries";



const MapEditor = (props) => {
    let currentUser = props.authenticatedUser;
  const location = useLocation();
  const cookies = new Cookies();
  const [collabList, setCollabList]=useState([])
  const [drag, setDrag]=useState(false);

  React.useEffect(() => {
    if(currentUser.id === "-1"){
      let path = location.pathname.split("/");
      let user = cookies.get(path[path.length - 2]);
      let mapId = path[path.length - 1]
      props.authenticateUser(user);
      props.editMap(mapId);
    }
  }, []);

    const [mapWidth, setMapWidth]=useState(15)
    const [mapHeight, setMapHeight]=useState(15)
    const [tileWidth, setTileWidth]=useState(50)
    const [tileHeight, setTileHeight]=useState(50)

    const [GIDTable, setTable] = useState([]);
    const canvasRef=useRef(null);
    const contextRef=useRef(null);
    const [isDrawing, setIsDrawing]= useState(false);

    const [saveJSON, toggleJSON] =useState(false);
    const [importPNG, togglePNG] = useState(false);
    const [clearCanvas, setClearCanvas]=useState(false);
    const [tileList, setTileList] = useState([]); //used for keeping track of the imported tilesets for the current instance of the map editor
    const [importedTileList, editImportedTileList] = useState([]); //used for keeping track of the names of each imported Tileset to provide mappings between names and starting GIDs
    //have mapping between tileset name and starting GID
    //when figuring out which tile to pull, reference the GID and GID mapping, then do math to figure out which one to pull


    React.useEffect(() => {
        console.log("Tilelisttttttttttttttttttttttttttt ", tileList);
    });
  
    const { data, loading, error } = useQuery(GET_MAP, {
        variables: {
          id: props.map,
        }
      });

      const refetchTileset = {
        refetchQueries: [
          {
            query: GET_MAP,
            variables: {id: props.map}
          }
        ]
      };


      React.useEffect(() => {
        if(data) {
            console.log(data);
            
          setCollabList([...  data.getMap.collabolators])

          let savedTileListData = JSON.parse(data.getMap.importedTileList);
          if(savedTileListData !== null){
            editImportedTileList(savedTileListData);
          }

          let savedTilesetData = JSON.parse(data.getMap.tilesets);
          if(savedTilesetData !== null){
            setTileList(savedTilesetData);
          }

          let savedMapData = JSON.parse(data.getMap.mapData);
          if(savedMapData !== null){
              console.log("THIS SETTING MAPDATA", savedMapData);
            editMap(savedMapData);
          }

          let savedLayerOrder = JSON.parse(data.getMap.layerOrder);
          if(savedLayerOrder !== null){
            editOrder(savedLayerOrder);
          }

          let savedMapHeight = JSON.parse(data.getMap.mapHeight);
          if(savedMapHeight !== null){
            setMapHeight(savedMapHeight);
          }

          let savedMapWidth = JSON.parse(data.getMap.mapWidth);
          if(savedMapWidth !== null){
            setMapWidth(savedMapWidth);
          }

          let savedTileHeight = JSON.parse(data.getMap.tileheight);
          if(savedTileHeight !== null){
            setTileHeight(savedTileHeight);
          }

          let savedTileWidth = JSON.parse(data.getMap.tilewidth);
          if(savedTileWidth !== null){
            setTileWidth(savedTileWidth);
          }

          console.log("TOMATO POTATO");
          console.log("THIS IS MY SAVED MAP DATA: ", savedMapData);
          console.log("THIS IS MY SAVED TILELIST DATA: ", savedTileListData);
          console.log("THIS IS MY SAVED TILESET DATA: ", savedTilesetData);
          console.log("THIS IS MY SAVED LAYERORDER DATA: ", savedLayerOrder);
        }
    }, [data])  
    
    const [addCollaborator] = useMutation(ADD_COLLABORATOR_MAP, refetchTileset);
    const [updateMap] = useMutation(UPDATE_MAP, refetchTileset);

    //GET_TILESETS QUERY
    const { loading: get_tilesets_loading, error: get_tilesets_error, data: tilesetData, refetch: refetchUserTilesets } = useQuery(GET_TILESETS, {
        variables: {ownerID: props.authenticatedUser.id}
    });
    if(tilesetData){
        
    }

    /**
     * Creates an empty dataMap using the dimensions of the map
     */
    const createDataMap = (old_map) => {
        if(old_map != null && old_map.length === parseInt(mapHeight) && old_map[0].length === parseInt(mapWidth)){
            return [];
        }
        let datamap = [];
        for(let i = 0; i < parseInt(mapHeight); i++){
            let row = []
            for(let j = 0; j < parseInt(mapWidth); j++){
                let grid_obj = {layers: []};
                if(old_map && old_map[i] && old_map[i][j] != null){
                    row.push(old_map[i][j]);
                }
                else{
                    row.push(grid_obj);
                }
            }
            datamap.push(row);
        }
        return datamap;
    }

    /**
     * Creates an empty dataMap using custom dimensions
     */
    const createDataMapCustom = (height, width) => {
        let datamap = [];
        for(let i = 0; i < height; i++){
            let row = []
            for(let j = 0; j < width; j++){
                let grid_obj = {layers: []};
                row.push(grid_obj);
            }
            datamap.push(row);
        }
        return datamap;
    }

    const [dataMap, editMap] = useState(() => createDataMap(null));
    const [selectedTile, changeSelect] = useState({gid: -1, dataURL: ""});
    const [layerOrder, editOrder] = useState([{id: uuidv4(), name: "Layer 1"}]);
    const[newDataMap, setNewDataMap]=useState([])

    /*
    React.useEffect(() => {
        console.log("THIS USEEFFECT HAS RUN!!!");
        if(contextRef.current !== null){
            console.log("WE ARE NOW INSIDE THIS USEEFFECT!!!");
            drawWholeMap();
        }
    }, [dataMap]);*/

    const setOrder = (new_arr) => {
        editOrder(new_arr);
    }
    
    /**
     * Erases a tile when the erase tool is selected a a cell is clicked
     */
    const setErase = (newState) => {
        if(newState){
            changeSelect({gid: 0, dataURL: ""});
        }
        else{
            changeSelect({gid: -1, dataURL: ""});
        }
    } 

    /**
     * Generates the map editor grid to be shown
     */
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

    /**
     * Creates an empty GID table cell
     */
    const createGIDTableElement = (grid_prop, img) => {
        let c = document.createElement('canvas');
        let ctx = c.getContext("2d");
        ctx.drawImage(img, grid_prop.sx, grid_prop.sy, 
            grid_prop.swidth, grid_prop.sheight, grid_prop.x, grid_prop.y, grid_prop.width, grid_prop.height);
        let dataURL =  c.toDataURL();
        return dataURL;
    }

    /**
     * Loads a tileset into the GID table
     */
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
        
        return GIDTable;
    }

    /**
     * Used for creating a map edit transaction
     */
    const editDataMap = (previousPixelState, updatedPixelState) => {
        let targetRow = previousPixelState.row;
        let targetCol = previousPixelState.col;

        let previousDataMap = dataMap;
        let clonedDataMap = JSON.parse(JSON.stringify(dataMap)); //create deep copy of dataMap
        clonedDataMap[targetRow][targetCol] = updatedPixelState.layers; //update the copy with the new pixel data

        //let newMapEditTransaction = new EditMap_Transaction(previousDataMap, clonedDataMap, editMap);
        //props.transactionStack.addTransaction(newMapEditTransaction);
    }

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
        
        getTable();
        

    }, [GIDTable.length == 0])


    const drawBoxes = () => {
        for(let i = tileWidth; i < (mapWidth * tileWidth); i += tileWidth){
            contextRef.current.moveTo(i, 0);
            contextRef.current.lineTo(i, (mapHeight * tileHeight))
        }

        for(let i = tileHeight; i < (mapHeight * tileHeight); i += tileHeight){
            contextRef.current.moveTo(0, i);
            contextRef.current.lineTo((mapWidth * tileWidth), i)
        }

        contextRef.current.strokeStyle = "black";
        contextRef.current.stroke();
    }

    useEffect(()=>{
         const canvas=canvasRef.current;
         canvas.width= parseInt(mapWidth) * parseInt(tileWidth);
         canvas.height= parseInt(mapHeight) * parseInt(tileHeight);
         const context= canvas.getContext("2d")
         context.lineCap="round"
         context.strokeStyle="Red"
         context.lineWidth=2;
         contextRef.current=context;
         canvasRef.current=canvas;
         contextRef.current.fillStyle = "white";
         contextRef.current.fillRect(0, 0, parseInt(canvas.width), parseInt(canvas.height))
         drawBoxes();
         drawWholeMap();
         console.log("TOMATO THIS WHEN IS THIS USEEFFECT EXECUTING ?!?!?!?!?!?!!?!??!?!", dataMap);
         
         let new_map = createDataMap(dataMap);
         console.log("New map length", new_map.length);
         if(parseInt(new_map.length) > 0){
            console.log("Its being calllllllllllled");
            editMap([...new_map])
         }
         console.log(`USE EFFECT HAS RUN !!!!!!! ${mapHeight} hihihihihihihi`);

         },[mapWidth, mapHeight, tileWidth, tileHeight, clearCanvas, layerOrder, dataMap]);
         console.log(`MAP HEIGHT IS ${mapHeight} hihihihihihihi`);

    function loadImage(url) {
    return new Promise((fulfill, reject) => {
        let imageObj = new Image();
        imageObj.onload = () => fulfill(imageObj);
        imageObj.setAttribute('crossOrigin', 'anonymous');
        imageObj.src = url;
    });
    }

    /*
    useEffect(() => {
        if(contextRef.current != null){
            console.log("TOMATO THIS SANITY CHECK ", dataMap);
            drawWholeMap();
        }
    }, [dataMap])*/


    const drawBox = async(layers, x, y) => {
        if(x == 0 && y == 0){
            console.log("THIS INSIDE DRAWBOX", dataMap);
        }
        contextRef.current.clearRect(x * tileWidth,  y * tileHeight, tileWidth, tileHeight);

        for(let i = 0; i < layerOrder.length; i++){
            let image_data = layers.find(x => x.layer_id === layerOrder[i].id);
            if(image_data){
                //console.log("THIS DRAWING BOX!!!", x, y);
                let img = await loadImage(image_data.data);
                contextRef.current.drawImage(img, x * tileWidth, y * tileHeight);
            }
            else{
            }
        }

        contextRef.current.beginPath();
        contextRef.current.rect(x * tileWidth,  y * tileHeight, tileWidth, tileHeight);
        contextRef.current.stroke();
        contextRef.current.closePath();
    }

    //DANGEROUS FUNCTION: Use only as last resort
    const drawWholeMap = () =>{
        for(let i = 0; i < dataMap.length; i += 1){
            for(let j = 0; j < dataMap[i].length; j += 1){
                drawBox(dataMap[i][j].layers, j, i);
            }
        }
    }

    const drawBoxCustom = (layers, layerOrder, width, height, x, y) => {
        contextRef.current.clearRect(x * width,  y * height, width, height);
        contextRef.current.rect(x * width,  y * height, width, height);
        contextRef.current.stroke();

        for(let i = 0; i < layerOrder.length; i++){
            let image_data = layers.find(x => x.layer_id === layerOrder[i].id);
            if(image_data){
                let img = new Image;
                img.src = image_data.data;
                contextRef.current.drawImage(img, x * width, y * height);
            }
            else{
            }
            
        }
    }

    //Wicked DANGEROUS FUNCTION: Use only as last resort
    const drawWholeMapCustom = (customDataMap, layerOrder) =>{
        for(let i = 0; i < customDataMap.length; i += 1){
            for(let j = 0; j < customDataMap[i].length; j += 1){
                drawBoxCustom(customDataMap[i][j].layers, layerOrder, i, j);
            }
        }
    }

    const handleDragEnter=({nativeEvent})=>{
        placeTile(nativeEvent)
    }
    const handleDoubleClick=()=>{
        setDrag(!drag)
    }
    const handleMouseOut=()=>{
        setDrag(false)
    }

    const placeTileMove =async({nativeEvent}) => {
        if (drag){
       
        
        const{offsetX, offsetY}=nativeEvent;
        let x =  Math.floor(offsetX / tileWidth);
        let y = Math.floor(offsetY / tileHeight);

        let new_arr = await [...dataMap];
        let layers = new_arr[y][x].layers;
        let last_layer = layerOrder[layerOrder.length - 1];
        let new_layers =  JSON.parse(JSON.stringify(layers));
        if(selectedTile.gid > 0){
            let {gid, data} = selectedTile;
            let index = new_layers.findIndex(x => x.layer_id === last_layer.id);
            if(index == -1){
                new_layers.push({layer_id: last_layer.id, gid: gid, data: data});
            }
            else{
               new_layers[index].gid = gid;
               new_layers[index].data = data;
            }
        }
        else if(selectedTile.gid === 0){
            let index = new_layers.findIndex(x => x.layer_id === last_layer.id);
            if(index != -1){
               new_layers.splice(index, 1);
            }
        }
        new_arr[y][x].layers = new_layers;
        drawBox(new_layers, x, y);
        //editMap(new_arr); //update the dataMap

        /*
        console.log("THIS IS MY DATA MAP (PLACE TILE): ", new_arr);
        console.log("THESE ARE THE TILESETS FOR MY DATAMAP: ", tileList);
        editMap(new_arr);*/
    }
    }

    
    

    const placeTile =({nativeEvent}) => {
        
        const{offsetX, offsetY}=nativeEvent;
        
        
        let x =  Math.floor(offsetX / tileWidth);
        let y= Math.floor(offsetY / tileHeight);
        let new_arr = [...dataMap];
        let layers = new_arr[y][x].layers;
        let last_layer = layerOrder[layerOrder.length - 1];
        let new_layers =  JSON.parse(JSON.stringify(layers));
        if(selectedTile.gid > 0){
            let {gid, data} = selectedTile;
            let index = new_layers.findIndex(x => x.layer_id === last_layer.id);
            if(index == -1){
                new_layers.push({layer_id: last_layer.id, gid: gid, data: data});
            }
            else{
               new_layers[index].gid = gid;
               new_layers[index].data = data;
            }
        }
        else if(selectedTile.gid === 0){
            let index = new_layers.findIndex(x => x.layer_id === last_layer.id);
            if(index != -1){
               new_layers.splice(index, 1);
            }
        }
        
        new_arr[y][x].layers = new_layers;
        drawBox(new_layers, x, y);
        //editMap(new_arr);
    }

    const populateDataMap = (map_obj, imported_tiles) => {
        let dataMap = createDataMapCustom(map_obj.height, map_obj.width); //creates an empty dataMap

        

        let mapLayers = map_obj.layers;
        let layerName, layer_id, layer_obj;
        let layerOrderArray = [];
        for(let layers = 0; layers < mapLayers.length; layers++){
            layer_obj = mapLayers[layers];
            layerName = layer_obj.name;
            layer_id = uuidv4();
            layerOrderArray.push({id: layer_id, name: layerName});
            let layerDataCounter = 0;
            for(let row = 0; row < dataMap.length; row++){
                for(let col = 0; col < dataMap[row].length; col++){
                    let gid = layer_obj.data[layerDataCounter];
                    let data = imported_tiles.tiles.find(x => x.gid === gid).data; //wicked slow
                    dataMap[row][col].layers.push({layer_id: layer_id, gid: gid, data: data});
                    layerDataCounter++;
                }
            }
        }

        console.log("THIS IS MY POPULATED DATAMAP: ", dataMap);
        let populatedDataMap = dataMap;
        return {populatedDataMap, layerOrderArray};

    }

    /**
     * sets the tileList state variable to the imported tileset to be rendered in the right toolbar
     */
    const importTileset = (imported_tiles, map_obj) => {
        let tilesetName = imported_tiles.TSName;
        let tileCount = imported_tiles.numTiles;
        let tileheight = imported_tiles.tileHeight;
        let tilewidth = imported_tiles.tileWidth;
        let export_ts = imported_tiles.export_ts;

        if(tileList.length > 0){
            let startingGID = importedTileList[importedTileList.length - 1].tileCount + importedTileList[importedTileList.length - 1].startingGID;
             
            export_ts.firstgid = startingGID;
            //POPULATES GID TABLE
            
            for(let i = 0; i < imported_tiles.tiles.length; i++){
                imported_tiles.tiles[i].gid = imported_tiles.tiles[i].gid + startingGID - 1;
            }

            //POPULATE DATAMAP HERE
            let orderArray;
            if(map_obj !== null){
                let { populatedDataMap, layerOrderArray} = populateDataMap(map_obj, imported_tiles);
                orderArray = layerOrderArray;
                
                editMap([...populatedDataMap]);

                setTileWidth(map_obj.tilewidth);
                setTileHeight(map_obj.tileheight);
                setMapWidth(map_obj.width);
                setMapHeight(map_obj.height);

                setOrder([...layerOrderArray]);
            }

            editImportedTileList(oldTilelistArray => [...oldTilelistArray, {tilesetName, startingGID, tileheight, tilewidth, tileCount, export_ts}]);
            setTileList(oldArray => [...oldArray, imported_tiles]);

            // setTileWidth(map_obj.tilewidth);
            // setTileHeight(map_obj.tileheight);
            // setMapWidth(map_obj.width);
            // setMapHeight(map_obj.height);
            
            //editImportedTileList(oldTilelistArray => [...oldTilelistArray, {tilesetName, startingGID, tileheight, tilewidth, tileCount}]);
        }
        else{
            //POPULATE DATAMAP HERE
            let orderArray;
            if(map_obj !== null){
                let { populatedDataMap, layerOrderArray} = populateDataMap(map_obj, imported_tiles);
                orderArray = layerOrderArray;

                editMap([...populatedDataMap]);

                setTileWidth(map_obj.tilewidth);
                setTileHeight(map_obj.tileheight);
                setMapWidth(map_obj.width);
                setMapHeight(map_obj.height);

                setOrder([...layerOrderArray]);
            }
            
            setTileList([imported_tiles]);
            editImportedTileList([{tilesetName, startingGID: 1, tileheight, tilewidth, tileCount, export_ts}]);

            
            //setTileWidth(map_obj.tilewidth);
            //setTileHeight(map_obj.tileheight);
            //setMapWidth(map_obj.width);
            //setMapHeight(map_obj.height);
        }
    }
    

    /**
     * 
     * 
     * @param {*map} map_obj 
     * @param {*array of tileset names} used_tilesets 
     */
    const importMap = async(map_obj, used_tilesets) => {
        await refetchUserTilesets();
        if(tilesetData){
            //store the queried tileset data

            let crossCheckSuccess;
            for(let tileset = 0; tileset < used_tilesets.length; tileset++){
                crossCheckSuccess = false;
                for(let mapTilesets = 0; mapTilesets < tilesetData.getOwnerTilesets.length; mapTilesets++){
                    if(tilesetData.getOwnerTilesets[mapTilesets].name === used_tilesets[tileset]){
                        crossCheckSuccess = true;
                    }
                }
                if(!crossCheckSuccess){
                    //DO NOT LET USER IMPORT BECAUSE ONE OF THE TILESETS ASSOCIATED WITH THIS MAP IS NOT ASSOCIATED WITH THE USER
                }
                crossCheckSuccess = false;
            }

            //IMPORT TILESET ON THE MAP EDITOR NEEDS TO BE FIXED FIRST: TO TEST IMPORTING A MAP, A MAP MUST FIRST BE CREATED USING TAPS WHICH REQUIRES A TILESET (ALSO CREATED USING TAPS)
            //TO BE OPENED AND ASSOCIATED WITH THE MAP. THIS IS BECAUSE WHEN QUERYING THE DB, WE NEED TO SEE IF THE TILESETS ASSOCIATED WITH THE MAP ARE ALSO OWNED BY THE USER; OTHERWISE,
            //WE DON'T LET THEM IMPORT THE TILESET
        }

        //import each tileset to the right toolbar
        let tileset;
        for(let mapTileset = 0; mapTileset < tilesetData.getOwnerTilesets.length; mapTileset++){
            
            tileset = await loadTSMapEditor(tilesetData.getOwnerTilesets[mapTileset].imagewidth, tilesetData.getOwnerTilesets[mapTileset].imageheight, 
                tilesetData.getOwnerTilesets[mapTileset].tilewidth, tilesetData.getOwnerTilesets[mapTileset].tileheight, tilesetData.getOwnerTilesets[mapTileset].image, 
                tilesetData.getOwnerTilesets[mapTileset].name);
                
            importTileset({TSName: tilesetData.getOwnerTilesets[mapTileset].name, tiles: tileset, tileHeight: tilesetData.getOwnerTilesets[mapTileset].tileheight, 
                tileWidth: tilesetData.getOwnerTilesets[mapTileset].tilewidth, numTiles: tilesetData.getOwnerTilesets[mapTileset].tilecount}, map_obj);
                
        }

        setMapHeight(10);
    }

    const handleImageSelected = async (image) => {
        console.log("New File Selected");
            const formData = new FormData();
            const unsignedUploadPreset = 'ngrdnw4p'
            formData.append('file', image);
            formData.append('upload_preset', unsignedUploadPreset);
    
            console.log("Cloudinary upload");
            let url = await uploadImageToCloudinaryAPIMethod(formData).then((response) => {
                //console.log("Upload success");
                return response.secure_url;
                
            });
            return url;
    }

    const saveMapToDB = async() => {
        console.log(tileList);
        let accessDataURLS;
        let tileListCloudinary = JSON.parse(JSON.stringify(tileList));
        for(let tileset = 0; tileset < tileListCloudinary.length; tileset++){
            accessDataURLS = tileListCloudinary[tileset].export_ts.image;
            let cloudinaryLink = await handleImageSelected(accessDataURLS) //convert to cloudinary link
            tileListCloudinary[tileset].export_ts.image = cloudinaryLink;
            console.log("CLOUDINARY LINK: ", cloudinaryLink);
        }

        console.log(tileListCloudinary);

        let updatedMap = await updateMap({ variables: { 
            id: props.map, 
            input: { mapData: JSON.stringify(dataMap), importedTileList: JSON.stringify(importedTileList), tilesets: JSON.stringify(tileListCloudinary), 
                layerOrder: JSON.stringify(layerOrder), mapHeight: parseInt(mapHeight), mapWidth: parseInt(mapWidth), tileheight: parseInt(tileHeight), 
                tilewidth: parseInt(tileWidth)}
        }});
    }
    
    const [toggleLock] = useMutation(TOGGLE_LOCK);
    const unlock = async() => {
      let result = await toggleLock({
        variables: {
          id: props.map,
          assetType: "Map",
          userId: props.authenticatedUser.id,
          lock: false
        }
      });
      let success = result.data.toggleLock;
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        borderRadius:2,
        p: 4,
      };

    const changeTile = (tileObj) => {
        changeSelect(tileObj);
    }

    
    const turnOnJSONMod = () => {
        toggleJSON(true);
    }
    return (
        <>
        <ReactRouterPrompt when={true}>
          {({ isActive, onConfirm, onCancel }) => (
          <Modal open={isActive} sx={{borderRadius:"10px", }}>
            
            <Box sx={style} >
            <p>Do you really want to leave?</p>
            <Box sx={{ display:"flex"  }} >
            <Button variant="contained" sx={{ marginLeft: "auto" }}onClick={onCancel} color="error">Cancel</Button>
            <Button align= "right" variant="contained" sx={{ml:1}} color="success" onClick={(event) => {
              unlock();
              onConfirm(event);
            }}>Ok</Button>
            </Box>
            </Box>
        </Modal>
          )}
        </ReactRouterPrompt>
        <Box sx={{ display: 'flex' }}>
        <Grid container 
        direction='row'
        >
        <Grid item  md={2}>
        <ToolbarLeft turnOnJSONMod={turnOnJSONMod} transactionStack = {props.transactionStack} mapHeight={mapHeight} mapWidth={mapWidth} setMapHeight={setMapHeight} setMapWidth={setMapWidth} tileHeight={tileHeight} tileWidth={tileWidth} setTileHeight={setTileHeight} setTileWidth={setTileWidth} importMap = {importMap} saveMapToDB = {saveMapToDB}></ToolbarLeft>
        </Grid>
        <Grid item className={"canvas-grid"} md={8} sx={{pt:4, pl:10}}>
            <Box>
            </Box>
            <Box>
                <canvas className='canvas-main'
                ref={canvasRef}
                onMouseDown={placeTile}
                 onMouseMove={ placeTileMove}
                 onDoubleClick={handleDoubleClick}
                 onMouseOut={handleMouseOut}
                
                
                ></canvas>
            </Box>
        </Grid>
        <Grid item  md={2}>


        <ToolbarRight importTileset={importTileset} importedTileList = {importedTileList} tiles = {/*GIDTable*/tileList} select ={(tile) => {
            changeSelect(prev => (tile));

        }} changeSelect={changeTile} togglePNG={togglePNG} setErase={setErase} layerOrder={layerOrder} setOrderCallback={setOrder}  map={props.map}currentUser={currentUser} collaborators={collabList} addCollaborator={addCollaborator}></ToolbarRight>


        </Grid>
        </Grid>
        </Box>
        <JSONSaveModal open={saveJSON} onClose={() => toggleJSON(false)} layerOrder={layerOrder} tileWidth={tileWidth} tileHeight={tileHeight}
        dataMap={dataMap} mapWidth={mapWidth} mapHeight={mapHeight} importedTileList={importedTileList}/>
        <PNGModal open={importPNG} onClose={() => togglePNG(false)} importTileset={importTileset}/>
        </>
        
    )
}

export default MapEditor


