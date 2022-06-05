import React, { useContext, useEffect, useRef } from "react";
import MapContext from "../Map/MapContext";
import { Control } from 'ol/control';
import Button from 'react-bootstrap/Button';
import Stack  from 'react-bootstrap/Stack'
import { Stack as StackIcon, MagnifyingGlass, Tree } from "phosphor-react";

/*
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
*/

import './ToolsControl.css';

const ToolsControl = () => {
    
    const { map, onOpenLayers, onGeoCode, onQuery } = useContext(MapContext);
    const btnTools = useRef(null);

    useEffect(() => {
        if (!map) return;
        const btnT = new Control({
            element: btnTools.current
        });
        map.controls.push(btnT);
		return () => map.controls.remove(btnT);
       
    }, [map]);

	return (
        <div className="tools" ref={btnTools}>
            <Stack gap={2}>
                <Button variant="primary" onClick={onOpenLayers}><StackIcon size={24} /></Button>
                <Button variant="primary" onClick={onGeoCode}><MagnifyingGlass size={24} /></Button>
                <Button variant="primary" onClick={onQuery}><Tree size={24} /></Button>
            </Stack>
        </div>
    );

};

export default ToolsControl;