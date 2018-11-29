import React, {Component }from "react";
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import { slide as Menu } from "react-burger-menu";
import './App.css';
import { Data } from "./Data";
const { InfoBox } = require("react-google-maps/lib/components/addons/InfoBox");

//Using https://github.com/tomchentw/react-google-maps library for Google Map Integration
const MyMapComponent = compose(
	withProps({
		googleMapURL:"https://maps.googleapis.com/maps/api/js?key=AIzaSyA14L7qSnS_IFi6pzCPWp4Hum1RhBBNMpM",
		loadingElement: <div style={{ height: `100%` }} />,
		containerElement: <div style={{ height: `90vh` }} />,
		mapElement: <div style={{ height: `100%` }} />,
	}),
	withScriptjs,
	withGoogleMap
)((props) =>
	<GoogleMap defaultZoom={13} defaultCenter={props.center}
		>
		//Creates Markers and sets Info-Window
		{props.positions.map(position =>
		<Marker key={position.id }position={position} onClick={() => props.onMarkerClick(position.id)} animation= {position.animation} >
			{position.isInfoBoxShown &&
			<InfoBox onCloseClick={() => props.onMarkerClick(position.id)}
				options={{ closeBoxURL: ``, enableEventPropagation: true }} >
				<InfoView info={position}/>
			</InfoBox>
			}
		</Marker>
		)}
	</GoogleMap>
)

//The custom view for Info-Window for "providing additional data about a location"
const InfoView = (props) => (
	<div  className="infobox">
		<div className="infobox-title">
			{props.info.name}
		</div>
		<div  className="infobox-coordinate">
			Cordinates: ({props.info.lat}, {props.info.lng})
		</div>
		<div className="book-cover" style={{ width: `220px`, height: `10vh`, background: "no-repeat center/cover url("+props.info.imgUrl+")"}}></div>
		<div className="infobox-info">
			{props.info.infoText}
		</div>
	</div>
)

//The Main App Component
class App extends Component {

	state = {
		defaultCenter: { lat: 25.435801, lng: 81.846311 },
		isInfoBoxShown: false,
		defaultPositions :  Data
	}

	//Sets additional states after the component is mounted
	componentWillMount(){
		this.state.defaultPositions.map((position) =>  Object.assign(position, { isInfoBoxShown: false, animation: 0}))
		this.setState({	positions: this.state.defaultPositions , searchPositions: this.state.defaultPositions, center: this.state.defaultCenter})
	}

	//It creates/hides Info-Window and animates the marker
	handleInfoBox = (id) => {
		const currentPosition = this.state.positions.find(position => position.id === id);
		const currentPositionStatus = currentPosition.isInfoBoxShown;
		const currentPositionPoints = {lat: currentPosition.lat, lng: currentPosition.lng}
		if (currentPositionStatus) {
			this.setState({center: this.state.defaultCenter})
		} else {
			//ANIMATION for 850ms
			this.setState({
				positions:  this.state.positions.map( (position) =>
					id === position.id
					? Object.assign(position, {animation: 1 })
					: position)
			});

			setTimeout(() => {
				this.setState({ positions: this.state.positions.map( position =>
					id === position.id ? Object.assign(position, {animation: 0}) : position
				) , center: currentPositionPoints});
			}, 850);

		}
		//SHOWS/HIDES THE INFO-WINDOWS
		this.setState({
			positions:  this.state.positions.map( (position) =>
				id === position.id
				? Object.assign(position, {isInfoBoxShown: !currentPositionStatus})
				: position)
		});
	}

	//Called when the Reset button is clicked or filter input box is cleared
	removefilter(){
		const stockPositions = this.state.positions.map( (position) =>
			position.isInfoBoxShown
			? Object.assign(position, {isInfoBoxShown: false})
			: position)

		this.setState({	positions: stockPositions, searchPositions: stockPositions })
		this.setState({	positions: this.state.defaultPositions, searchPositions: this.state.defaultPositions })
		this.refs.filterInput.value = '';

	}

	//Filters locations
	searchLocations(query){
		if (query) {
			let filteredPositions =  this.state.defaultPositions.filter(position => ( position.name.replace(/ /g,'').toLowerCase().includes(query.replace(/ /g, '').toLowerCase())))
			this.setState({positions: filteredPositions, searchPositions: filteredPositions})
		} else {
			this.removefilter();
		}
	}

	render(){
		return (
			<div outercontainerid={ "outer-container" }>
				<div className="App" role="tabpanel">
					<header className="page-header">
						<h1>Prayagraj's Historic Places</h1>
					</header>
				</div>

				//Using https://github.com/negomi/react-burger-menu library for Menu
				<Menu isOpen={ true } pageWrapId={ "page-wrap" } outerContainerId={ "outer-container" } right noOverlay aria-label="List of Locations">
					<div id="filter" aria-label="Filter Section">
						<input
							id="filter-input"
							type="text"
							ref="filterInput"
							placeholder="Filter Locations"
							onChange={(event) => this.searchLocations(event.target.value)}
							/>
						<button id="filter-reset" onClick={() => this.removefilter()} aria-label="Resets the filters">Reset</button>
					</div>

					{this.state.searchPositions.map(position => (
					<a key={position.id} id={position.id} className={position.isInfoBoxShown ? "menu-selected" : "" } onClick={() => this.handleInfoBox(position.id)} tabIndex={position.id+1}>{position.name}</a>
					))}
				</Menu>
				<main id="page-wrap">
					<MyMapComponent
						onMarkerClick={this.handleInfoBox}
						isInfoBoxShown={this.state.isInfoBoxShown}
						positions={this.state.positions}
						center={this.state.center}
						/>
				</main>
			</div>
		);
	}
}

export default App;
