import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import Select from 'react-select';

// Mock faculty data - in a real implementation, this would come from an API or JSON file
const facultyData = {
    faculty: [
        {
            id: "prof-101",
            name: "Dr. Jane Smith",
            department: "Computer Science",
            office: {
                building: "Technology Hall",
                room: "301",
                floor: 3,
                coordinates: [37.9315, 41.9378]
            }
        },
        {
            id: "prof-102",
            name: "Dr. Robert Johnson",
            department: "Mathematics",
            office: {
                building: "Science Building",
                room: "205",
                floor: 2,
                coordinates: [37.9320, 41.9380]
            }
        },
        {
            id: "prof-103",
            name: "Dr. Maria Garcia",
            department: "Biology",
            office: {
                building: "Life Sciences",
                room: "412",
                floor: 4,
                coordinates: [37.9318, 41.9375]
            }
        }
    ]
};

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component for faculty selection dropdown and Go button
function FacultySelector({ onSelect, onNavigate }) {
    const [selected, setSelected] = useState(null);

    const options = facultyData.faculty.map(f => ({
        value: f.id,
        label: `${f.name} (${f.department})`
    }));

    return (
        <div className="selector-container p-4 bg-white rounded shadow-md">
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Select Faculty Member:</label>
                <Select
                    options={options}
                    onChange={(option) => {
                        setSelected(option);
                        onSelect(option.value);
                    }}
                    placeholder="Select faculty member..."
                    className="w-full"
                />
            </div>
            <button
                onClick={onNavigate}
                disabled={!selected}
                className={`w-full py-2 px-4 rounded font-bold ${
                    selected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                Go
            </button>
        </div>
    );
}

// User location marker that updates in real-time
function UserLocationMarker({ position, following, setUserLocation }) {
    const map = useMap();
    const markerRef = useRef(null);
    const circleRef = useRef(null);

    // Create custom blue icon for user
    const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    useEffect(() => {
        // When position changes, update the marker position
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        }

        // Update circle marker position directly using the ref
        if (circleRef.current) {
            circleRef.current.setLatLng(position);
        }

        // If following is enabled, center the map on the user
        if (following) {
            map.setView(position, map.getZoom());
        }
    }, [position, map, following]);

    return (
        <>
            <Marker
                position={position}
                icon={blueIcon}
                ref={markerRef}
            >
                <Popup>You are here</Popup>
            </Marker>

            {/* Blue circle that moves with user location - with ref for direct updates */}
            <CircleMarker
                center={position}
                radius={8}
                fillColor="#1E40AF"
                fillOpacity={0.8}
                stroke={false}
                ref={circleRef}
            />
        </>
    );
}

// Realtime routing component that updates as user moves
function RealtimeRouting({ userLocation, destination, active }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    // Setup routing control
    useEffect(() => {
        if (!map || !active) return;

        if (!routingControlRef.current) {
            // Create new routing control if it doesn't exist
            const routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(userLocation[0], userLocation[1]),
                    L.latLng(destination[0], destination[1])
                ],
                lineOptions: {
                    styles: [{ color: '#6366F1', weight: 4 }],
                    extendToWaypoints: true,
                    missingRouteTolerance: 0
                },
                show: false,
                addWaypoints: false,
                routeWhileDragging: false,
                fitSelectedRoutes: true,
                showAlternatives: false
            });

            routingControl.addTo(map);
            routingControlRef.current = routingControl;

            // Fit map to show both points
            const bounds = L.latLngBounds(
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Update existing routing control
            const waypoints = [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            ];
            routingControlRef.current.setWaypoints(waypoints);
        }

        // Cleanup
        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [map, active]);

    // Update routing when user location changes
    useEffect(() => {
        if (routingControlRef.current && active) {
            const waypoints = routingControlRef.current.getWaypoints();
            waypoints[0].latLng = L.latLng(userLocation[0], userLocation[1]);
            routingControlRef.current.setWaypoints(waypoints);
        }
    }, [userLocation, active]);

    return null;
}

// Updated Map controls component that stays fixed during zoom/pan
function MapControls({ following, setFollowing, isNavigating, stopNavigation, isSimulating, toggleSimulation }) {
    const map = useMap();

    // Create a custom control for Leaflet
    useEffect(() => {
        // Create a custom control that will remain fixed during zoom/pan
        const customControl = L.control({ position: 'bottomright' });

        customControl.onAdd = function(map) {
            // Create a div element for the control
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.style.backgroundColor = 'transparent';
            container.style.border = 'none';
            container.style.boxShadow = 'none';

            // Add control content
            container.innerHTML = `
                <div class="flex flex-col space-y-2">
                    <button id="follow-btn" class="p-2 rounded-full ${
                following ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }" title="${following ? 'Stop following my location' : 'Follow my location'}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    ${isNavigating ? `
                        <button id="simulation-btn" class="p-2 rounded-full ${
                isSimulating ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
            }" title="${isSimulating ? 'Stop simulation' : 'Start simulation'}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    ` : ''}

                    ${isNavigating ? `
                        <button id="stop-nav-btn" class="p-2 rounded-full bg-red-500 text-white" title="Stop navigation">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `;

            // Prevent clicks on the control from propagating to the map
            L.DomEvent.disableClickPropagation(container);

            // Add event listeners
            const followBtn = container.querySelector('#follow-btn');
            if (followBtn) {
                L.DomEvent.on(followBtn, 'click', function() {
                    setFollowing(!following);
                });
            }

            const simulationBtn = container.querySelector('#simulation-btn');
            if (simulationBtn) {
                L.DomEvent.on(simulationBtn, 'click', toggleSimulation);
            }

            const stopNavBtn = container.querySelector('#stop-nav-btn');
            if (stopNavBtn) {
                L.DomEvent.on(stopNavBtn, 'click', stopNavigation);
            }

            return container;
        };

        // Add the control to the map
        customControl.addTo(map);

        // Remove the control when component unmounts
        return () => {
            map.removeControl(customControl);
        };
    }, [map, following, setFollowing, isNavigating, stopNavigation, isSimulating, toggleSimulation]);

    // Add map event listeners
    useMapEvents({
        // If user manually moves the map, disable following
        dragstart: () => {
            if (following) setFollowing(false);
        }
    });

    // This component no longer renders anything directly, as it sets up the control via useEffect
    return null;
}

// Distance calculator
function DistanceCalculator({ userLocation, destination, setRemainingDistance }) {
    useEffect(() => {
        if (!userLocation || !destination) return;

        // Calculate distance between points using Haversine formula
        const userLatLng = L.latLng(userLocation[0], userLocation[1]);
        const destLatLng = L.latLng(destination[0], destination[1]);
        const distanceInMeters = userLatLng.distanceTo(destLatLng);

        setRemainingDistance(Math.round(distanceInMeters));
        console.log(`Distance updated: ${Math.round(distanceInMeters)}m`);

        // Check if user has arrived (within 20 meters)
        if (distanceInMeters < 20) {
            alert("You have reached your destination!");
        }
    }, [userLocation, destination, setRemainingDistance]);

    return null;
}

// Simulation controller that moves user towards destination
function SimulationController({ isSimulating, destination, userLocation, setUserLocation, stopSimulation }) {
    const simulationIntervalRef = useRef(null);
    const stepSize = 0.00005; // How much to move in each step

    useEffect(() => {
        if (isSimulating && destination) {
            // Start the simulation
            simulationIntervalRef.current = setInterval(() => {
                const userLatLng = L.latLng(userLocation[0], userLocation[1]);
                const destLatLng = L.latLng(destination[0], destination[1]);
                const distanceInMeters = userLatLng.distanceTo(destLatLng);

                // Stop if we're very close to the destination
                if (distanceInMeters < 10) {
                    stopSimulation();
                    return;
                }

                // Calculate direction vector
                const dx = destination[0] - userLocation[0];
                const dy = destination[1] - userLocation[1];

                // Normalize the vector
                const length = Math.sqrt(dx * dx + dy * dy);
                const normalizedDx = dx / length;
                const normalizedDy = dy / length;

                // Move in the direction of the destination
                const newLocation = [
                    userLocation[0] + normalizedDx * stepSize,
                    userLocation[1] + normalizedDy * stepSize
                ];

                setUserLocation(newLocation);
            }, 100); // Update every 100ms for smooth movement
        } else if (simulationIntervalRef.current) {
            // Stop the simulation
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }

        // Cleanup on unmount or when simulation is stopped
        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
        };
    }, [isSimulating, destination, userLocation, setUserLocation, stopSimulation]);

    return null;
}

// Component for rendering the navigation map within the modal
function NavigationMap({ facultyId, userLocation, isLoading, isNavigating, setRemainingDistance, setUserLocation, stopNavigation }) {
    const [following, setFollowing] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const faculty = facultyData.faculty.find(f => f.id === facultyId);

    useEffect(() => {
        if (mapReady && faculty) {
            console.log("Map is ready and faculty is selected");
        }
    }, [mapReady, faculty]);

    const toggleSimulation = () => {
        setIsSimulating(!isSimulating);
    };

    const stopSimulation = () => {
        setIsSimulating(false);
    };

    if (isLoading || !faculty) {
        return <div className="flex items-center justify-center h-64">Loading map...</div>;
    }

    return (
        <div className="h-96 w-full rounded overflow-hidden relative">
            <div className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow-md">
                <div className="text-sm font-bold">
                    {isSimulating ? "Simulation Active" : "Simulation Inactive"}
                </div>
            </div>

            <MapContainer
                center={userLocation}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User location marker that updates in real-time */}
                <UserLocationMarker
                    position={userLocation}
                    following={following}
                    setUserLocation={setUserLocation}
                />

                {/* Faculty office marker with red icon */}
                <Marker
                    position={faculty.office.coordinates}
                    icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })}
                >
                    <Popup>
                        <div>
                            <strong>{faculty.name}</strong><br />
                            {faculty.department}<br />
                            {faculty.office.building}, Room {faculty.office.room}<br />
                            Floor {faculty.office.floor}
                        </div>
                    </Popup>
                </Marker>

                {/* Realtime routing that updates as user moves */}
                {isNavigating && (
                    <RealtimeRouting
                        userLocation={userLocation}
                        destination={faculty.office.coordinates}
                        active={isNavigating}
                    />
                )}

                {/* Map controls (follow button, simulation toggle, etc.) - Updated to use Leaflet Control */}
                <MapControls
                    following={following}
                    setFollowing={setFollowing}
                    isNavigating={isNavigating}
                    stopNavigation={stopNavigation}
                    isSimulating={isSimulating}
                    toggleSimulation={toggleSimulation}
                />

                {/* Distance calculator */}
                {isNavigating && (
                    <DistanceCalculator
                        userLocation={userLocation}
                        destination={faculty.office.coordinates}
                        setRemainingDistance={setRemainingDistance}
                    />
                )}

                {/* Simulation controller */}
                {isNavigating && (
                    <SimulationController
                        isSimulating={isSimulating}
                        destination={faculty.office.coordinates}
                        userLocation={userLocation}
                        setUserLocation={setUserLocation}
                        stopSimulation={stopSimulation}
                    />
                )}
            </MapContainer>
        </div>
    );
}

// Navigation instructions component
function NavigationInstructions({ facultyId, remainingDistance }) {
    const faculty = facultyData.faculty.find(f => f.id === facultyId);

    if (!faculty) return null;

    return (
        <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold text-lg mb-2">Office Information:</h3>
            <p><strong>Building:</strong> {faculty.office.building}</p>
            <p><strong>Room:</strong> {faculty.office.room}</p>
            <p><strong>Floor:</strong> {faculty.office.floor}</p>

            {remainingDistance !== null && (
                <div className="mt-2 p-3 bg-blue-100 rounded">
                    <p><strong>Remaining Distance:</strong> {remainingDistance > 1000
                        ? `${(remainingDistance / 1000).toFixed(2)} km`
                        : `${remainingDistance} meters`}
                    </p>
                </div>
            )}

            <p className="text-sm text-gray-600 mt-2">Follow the blue route on the map to reach the office.</p>
        </div>
    );
}

// Modal component
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
                {/* Overlay */}
                <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                    className="inline-block h-screen align-middle"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {title}
                    </h3>

                    <div className="mt-4">
                        {children}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component that can be imported and used on your homepage
export default function CampusNavigation() {
    const [selectedFacultyId, setSelectedFacultyId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState([37.9310, 41.9370]); // Default starting location near faculty offices
    const [isLoading, setIsLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [remainingDistance, setRemainingDistance] = useState(null);
    const watchPositionRef = useRef(null);

    // We'll use this flag to determine if we're in simulation mode or real geolocation mode
    const [isUsingRealGeolocation, setIsUsingRealGeolocation] = useState(false);

    // Start watching user's location when component mounts (only if not simulating)
    useEffect(() => {
        if (navigator.geolocation && isUsingRealGeolocation) {
            // First get a single position with high accuracy
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                    console.log("Initial position set:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting initial location:", error);
                    setLocationError("Couldn't access your location. Using default location instead.");
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000 // Reduced timeout for faster initial response
                }
            );

            // Then start watching position with optimized settings for real-time updates
            watchPositionRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    // Use requestAnimationFrame for smoother updates
                    requestAnimationFrame(() => {
                        setUserLocation([
                            position.coords.latitude,
                            position.coords.longitude
                        ]);
                    });
                    console.log("Position updated:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Error watching location:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0, // Don't use cached positions
                    timeout: 2000, // Shorter timeout for more frequent updates
                }
            );
        } else if (!isUsingRealGeolocation) {
            console.log("Using simulated location instead of real geolocation");
        } else {
            setLocationError("Geolocation is not supported by your browser. Using default location instead.");
        }

        // Cleanup watchPosition on unmount
        return () => {
            if (watchPositionRef.current) {
                navigator.geolocation.clearWatch(watchPositionRef.current);
            }
        };
    }, [isUsingRealGeolocation]);

    const handleNavigate = () => {
        if (!selectedFacultyId) return;

        setIsLoading(true);
        setIsModalOpen(true);
        setIsNavigating(true);

        // Simulate loading the map data
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const stopNavigation = () => {
        setIsNavigating(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsNavigating(false);
    };

    const selectedFaculty = facultyData.faculty.find(f => f.id === selectedFacultyId);
    const modalTitle = selectedFaculty ? `Navigation to ${selectedFaculty.name}'s Office` : '';

    return (
        <div className="container mx-auto p-4 max-w-md">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Campus Navigation System</h1>
                <p className="text-gray-600">Find your way to faculty offices</p>
                <p className="text-sm text-blue-600 mt-2">
                    Simulation Mode: Click the play button in the map to start or stop the walking simulation
                </p>
            </div>

            {locationError && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                    {locationError}
                </div>
            )}

            <FacultySelector
                onSelect={setSelectedFacultyId}
                onNavigate={handleNavigate}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalTitle}
            >
                <NavigationMap
                    facultyId={selectedFacultyId}
                    userLocation={userLocation}
                    isLoading={isLoading}
                    isNavigating={isNavigating}
                    setRemainingDistance={setRemainingDistance}
                    setUserLocation={setUserLocation}
                    stopNavigation={stopNavigation}
                />

                <NavigationInstructions
                    facultyId={selectedFacultyId}
                    remainingDistance={remainingDistance}
                />

                {isNavigating && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={stopNavigation}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                            <span>Stop Navigation</span>
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}