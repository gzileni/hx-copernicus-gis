
import React, { useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import GeoJSON from 'ol/format/GeoJSON';
import './Geocoding.css';
import axios from 'axios';
import _ from 'lodash';

const Geocoding = (view) => {

    const [error, setError] = useState('')
    let cityCtrl = useRef(null);
    let countryCtrl = useRef(null);
    let zipCtrl = useRef(null);
    let addressCtrl = useRef(null);

    const onSearch = (event) => {

        const city = cityCtrl !== null && cityCtrl !== undefined ? cityCtrl.current.value : '';
        const country = countryCtrl !== null && countryCtrl !== undefined ? countryCtrl.current.value : '';
        const zip = zipCtrl !== null && zipCtrl !== undefined ? zipCtrl.current.value : '';
        const address = addressCtrl !== null && addressCtrl !== undefined ? addressCtrl.current.value : '';
        
        let url = 'https://nominatim.openstreetmap.org/search?format=geojson';
        url += city !== '' ? `&city=${city}` : '';
        url += country !== '' ? `&country=${country}` : '';
        url += zip !== '' ? `&postalcode=${zip}` : '';
        url += address !== '' ? `&street=${address}` : '';

        const geocode_config = {
			method: 'get',
			url: url,
			headers: { },
			timeout: 10000,
			maxRedirects: 0
		};

		axios(geocode_config).then(result => {

            let features = new GeoJSON().readFeatures(result.data);
            let geometries = _.map(features, feature => {
                return feature.getGeometry()
            });

            const isNullIdx = _.findIndex(geometries, g => {
                return g === null
            });

            if (_.size(geometries) > 0 && isNullIdx === -1) {
                view.view.setCenter(geometries[0].getCoordinates());
                view.view.setZoom(15);
            } else {
                setError('Non riesco a trovare il luogo richiesto.')
            }

		}).catch(function (error) {
            console.log(error);
        });

    }

    return (
            <div className="tools-container geocoding shadow">
                <Form noValidate>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" placeholder="City" ref={cityCtrl} />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid city.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md="3" controlId="country">
                            <Form.Label>Country</Form.Label>
                            <Form.Control type="text" placeholder="Country" ref={countryCtrl} />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid country.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} md="3" controlId="zip">
                            <Form.Label>Zip</Form.Label>
                            <Form.Control type="text" placeholder="Zip" ref={zipCtrl} />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid zip.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="address">
                            <Form.Label>Address</Form.Label>
                            <Form.Control type="text" placeholder="Address" ref={addressCtrl} />
                            <Form.Control.Feedback type="invalid">
                                Please provide a valid address.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        { error }
                    </Row>
                    <Row className="mb-6">
                        <Button type="button" onClick={onSearch}>Cerca</Button>
                    </Row>
                </Form>
            </div>)
}

export default Geocoding;