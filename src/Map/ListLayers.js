
import React, { useState, useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { Warning, ThumbsUp } from "phosphor-react";
import './ListLayers.css';
import _ from 'lodash';

const ListLayerItem = (params) => {

    const [layerCheck, setLayerCheck] = useState({});
    const [status, setStatus] = useState('');

    useEffect(() => {

        if (!_.isEmpty(layerCheck)) {
            
            let layer = _.find(params.map.getAllLayers(), item => {
                return item.get('id') === layerCheck.id
            });

            if (layer !== null && layer !== undefined) {
                layer.setVisible(layerCheck.visible);

                layer.getSource().on('tileloadstart', event => {
                    setStatus('loading');
                });

                layer.getSource().on('tileloaderror', (event) => {
                    setStatus('error');
                });

                layer.getSource().on('tileloadend', (event) => {
                    setStatus('loaded');
                });
            }
        }

    }, [layerCheck, params.map])

    return (<ListGroup.Item key={params.layer.key}>
                <Row>
                    <Col sm={8}>
                        <Form.Check 
                            type="switch"
                            id={ params.layer.key }
                            label={ params.layer.value }
                            onChange={ e => setLayerCheck({ id: e.target.id, visible: e.target.checked}) } 
                            />
                    </Col>
                    <Col sm={4}>
                        { 
                            status === 'loading' ? 
                            <Spinner animation="border" variant="primary" /> :
                            status === 'error' ?
                            <Warning size={24} /> : 
                            status === 'loaded' ?
                            <ThumbsUp size={24} /> :
                            null
                        }
                    </Col>
                </Row>
            </ListGroup.Item>)
}

const ListLayers = (params) => {

    return (<div className="tools-container listLayers">
                <Accordion defaultActiveKey="0">
                    {
                        _.map(params.service, (item, index) => (
                            <Accordion.Item eventKey={ index } key={ index }>
                                <Accordion.Header>{ item.name }</Accordion.Header>
                                <Accordion.Body>
                                    <div className="layers">
                                        <ListGroup variant="flush">
                                            {
                                                _.map(item.layers, layer => (
                                                    <ListLayerItem key={layer.key} layer={layer} map={params.map} />
                                                ))
                                            }
                                        </ListGroup>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))
                    }
                </Accordion>
            </div>)
}

export default ListLayers;