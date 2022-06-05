import React, { useState, useEffect, useCallback } from "react";
import './Query.css';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button'
import moment from 'moment';

import GeoJSON from 'ol/format/GeoJSON';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer, Heatmap as HeatmapLayer} from 'ol/layer';

const axios = require('axios');

let layerOSM = null;
let layerHeatMap = null;

const Query = (params) => {

    const [pollution, setPollution] = useState('CO');
    const [queryDate, setQueryDate] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {

        if (layerOSM !== null && layerOSM !== undefined) {
            params.map.removeLayer(layerOSM);
        };

        if (params.view.getZoom() >= 12) {

            setLoading(true);

            const image = new CircleStyle({
                radius: 5,
                fill: null,
                stroke: new Stroke({color: 'red', width: 1}),
            });

            const styles = {
                'Point': new Style({
                    image: image,
                }),
                'LineString': new Style({
                    stroke: new Stroke({
                    color: 'green',
                    width: 1,
                    }),
                }),
                'MultiLineString': new Style({
                    stroke: new Stroke({
                    color: 'green',
                    width: 1,
                    }),
                }),
                'MultiPoint': new Style({
                    image: image,
                }),
                'MultiPolygon': new Style({
                    stroke: new Stroke({
                    color: 'yellow',
                    width: 1,
                    }),
                    fill: new Fill({
                    color: 'rgba(255, 255, 0, 0.1)',
                    }),
                }),
                'Polygon': new Style({
                    stroke: new Stroke({
                    color: 'blue',
                    lineDash: [4],
                    width: 3,
                    }),
                    fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                    }),
                }),
                'GeometryCollection': new Style({
                    stroke: new Stroke({
                    color: 'magenta',
                    width: 2,
                    }),
                    fill: new Fill({
                    color: 'magenta',
                    }),
                    image: new CircleStyle({
                    radius: 10,
                    fill: null,
                    stroke: new Stroke({
                        color: 'magenta',
                    }),
                    }),
                }),
                'Circle': new Style({
                    stroke: new Stroke({
                    color: 'red',
                    width: 2,
                    }),
                    fill: new Fill({
                    color: 'rgba(255,0,0,0.2)',
                    }),
                }),
            };

            const styleFunction = function (feature) {
                return styles[feature.getGeometry().getType()];
            };

            const data = JSON.stringify({
                "bbox": [
                    params.extent[1],
                    params.extent[0],
                    params.extent[3],
                    params.extent[2]
                ],
                "context": "pollution"
            });

            const config = {
                method: 'post',
                url: '/gs/context',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Cookie': 'lang=en-US'
                },
                timeout: 120000,
                maxRedirects: 0,
                data : data
            };

            axios(config).then(function (response) {

                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(response.data),
                });

                layerOSM = new VectorLayer({
                    source: vectorSource,
                    style: styleFunction,
                });

                params.map.addLayer(layerOSM);
                setLoading(false);

            })
            .catch(function (error) {
                console.log(error);
                setLoading(false);
            });
        }

    }, [params.extent, params.map, params.view])

    /**
     * 
     */
    const onSearch = useCallback(() => {
        
        setLoading(true);

        if (layerHeatMap !== null && layerHeatMap !== undefined) {
            params.map.removeLayer(layerHeatMap);
        };

        const end_d = queryDate === null || queryDate === undefined ?
                  moment() :
                  moment(queryDate);

        const start_d = queryDate === null || queryDate === undefined ?
                        moment().subtract(1, 'days') :
                        moment(queryDate).subtract(1, 'days');

        const data = JSON.stringify({
            "bbox": params.extent,
            "range": [
                start_d.format("YYYY-MM-DD"),
                end_d.format("YYYY-MM-DD")
            ],
            "pollution": pollution
        });

        const config = {
            method: 'post',
            url: '/copernicus/pollution',
            headers: { 
                'Content-Type': 'application/json'
            },
            timeout: 120000,
            maxRedirects: 0,
            data : data
        };

        axios(config).then(function (response) {
            
            if (response.data.features !== null && response.data.features !== undefined) {

                const vectorSource = new VectorSource({
                    features: new GeoJSON().readFeatures(response.data, {
                        dataProjection: "EPSG:4326",
                        featureProjection: "EPSG:4326"
                    })
                });
                
                let w = ''
                switch (pollution) {
                    case 'CO':
                        w = 'carbonmonoxide_total_column_corrected'
                        break;
                    case 'SO2':
                        w = 'sulfurdioxide_total_vertical_column'
                        break;
                    case 'NO2':
                        w = 'nitrogendioxide'
                        break;
                    case 'HCHO':
                        w = 'formaldehyde_tropospheric_vertical_column'
                        break;
                    case 'CH4':
                        w = 'methane_mixing_ratio'
                        break;
                    case 'AER':
                        w = 'aerosol_index_340_380'
                        break;
                    default:
                        w = ''
                };

                layerHeatMap = new HeatmapLayer({
                    source: vectorSource,
                    blur: 50,
                    radius: 10,
                    weight: function (feature) {
                        return feature.getProperties()[w];
                    }
                });
                
                params.map.addLayer(layerHeatMap);
            }
            setLoading(false);
            

        }).catch(function (error) {
            setLoading(false);
            console.error(error);
        });

    }, [params.extent, params.map, pollution, queryDate]);

    return (<div className="tools-container query">

                <Stack direction="horizontal" gap={2}>
                    <Form.Group className="mb-6" controlId="exampleForm.ControlInput1">
                        <Form.Label>Ultima data </Form.Label>
                        <Form.Control type="date" placeholder="select last date" onChange={ e => setQueryDate(e.target.value) } />
                    </Form.Group>
                    <Form.Group className="mb-6" controlId="exampleForm.ControlInput1">
                        <Form.Label>Inquinante atmosferico</Form.Label>
                        <Form.Select aria-label="Default select pollutions" onChange={ e => setPollution(e.target.value) }>
                            <option value="CO">Monossido di Carbonio (CO)</option>
                            <option value="NO2">Biossido di Azoto (NO2)</option>
                            <option value="SO2">Biossido di Zolfo (SO2)</option>
                            <option value="HCHO">Formaldeide (HCHO)</option>
                            <option value="CH4">Metano (CH4)</option>
                            <option value="AER">Aerosol (PM)</option>
                        </Form.Select>
                    </Form.Group>
                    <Button variant="primary" onClick={onSearch}>Cerca</Button>
                    { loading  ? <Spinner animation="border" variant="secondary" /> : null }
                </Stack>

            </div>)
}

export default Query;