import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import Select from 'react-select';

// Örnek öğretim üyesi verileri - gerçek bir uygulamada, bu veriler bir API veya JSON dosyasından gelecektir
const facultyData = {
    faculty: [
        {
            id: "prof-101",
            name: "Özlem Batur Dinler",
            department: "Bilgisayar Mühendisliği",
            office: {
                building: "Mühendislik Fakültesi",
                room: "301",
                floor: 3,
                coordinates: [37.9315, 41.9378]
            }
        },
        {
            id: "prof-102",
            name: "Züleyha Yiner",
            department: "Bilgisayar Mühendisliği",
            office: {
                building: "Mühendislik Fakültesi",
                room: "205",
                floor: 2,
                coordinates: [37.9320, 41.9380]
            }
        },
        {
            id: "prof-103",
            name: "Yahya Doğan  ",
            department: "Bilgisayar Mühendisliği",
            office: {
                building: "Mühendislik Fakültesi",
                room: "412",
                floor: 4,
                coordinates: [37.9318, 41.9375]
            }
        }
    ]
};

// Leaflet ikon sorunlarını düzeltme
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Öğretim üyesi seçim açılır listesi ve Git düğmesi bileşeni
function FacultySelector({ onSelect, onNavigate }) {
    const [selected, setSelected] = useState(null);

    const options = facultyData.faculty.map(f => ({
        value: f.id,
        label: `${f.name} (${f.department})`
    }));

    return (
        <div className="selector-container p-4 bg-white rounded shadow-md">
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-bold">Öğretim Üyesi seçin:</label>
                <Select
                    options={options}
                    onChange={(option) => {
                        setSelected(option);
                        onSelect(option.value);
                    }}
                    placeholder="Öğretim üyesi seçin..."
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
                Git
            </button>
        </div>
    );
}

// Gerçek zamanlı güncellenen kullanıcı konum işaretçisi
function UserLocationMarker({ position, following, setUserLocation }) {
    const map = useMap();
    const markerRef = useRef(null);

    // Kullanıcı için özel mavi ikon oluşturma
    const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    useEffect(() => {
        // Konum değiştiğinde, işaretçi konumunu güncelle
        if (markerRef.current) {
            markerRef.current.setLatLng(position);
        }

        // Eğer takip etme etkinleştirilmişse, haritayı kullanıcı üzerine ortala
        if (following) {
            map.setView(position, map.getZoom());
        }
    }, [position, map, following]);

    // Simüle edilmiş hareket kodu burada kaldırıldı

    return (
        <>
            <Marker
                position={position}
                icon={blueIcon}
                ref={markerRef}
            >
                <Popup>Buradasınız</Popup>
            </Marker>

            {/* Kullanıcı konumuyla hareket eden mavi daire */}
            <CircleMarker
                center={position}
                radius={8}
                fillColor="#1E40AF"
                fillOpacity={0.8}
                stroke={false}
            />
        </>
    );
}

// Kullanıcı hareket ettikçe güncellenen gerçek zamanlı rota bileşeni
function RealtimeRouting({ userLocation, destination, active }) {
    const map = useMap();
    const routingControlRef = useRef(null);

    // Rota kontrolünü ayarlama
    useEffect(() => {
        if (!map || !active) return;

        if (!routingControlRef.current) {
            // Mevcut değilse yeni rota kontrolü oluştur
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

            // Her iki noktayı da gösterecek şekilde haritayı ayarla
            const bounds = L.latLngBounds(
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Mevcut rota kontrolünü güncelle
            const waypoints = [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(destination[0], destination[1])
            ];
            routingControlRef.current.setWaypoints(waypoints);
        }

        // Temizleme
        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [map, active]);

    // Kullanıcı konumu değiştiğinde rotayı güncelleme
    useEffect(() => {
        if (routingControlRef.current && active) {
            const waypoints = routingControlRef.current.getWaypoints();
            waypoints[0].latLng = L.latLng(userLocation[0], userLocation[1]);
            routingControlRef.current.setWaypoints(waypoints);
        }
    }, [userLocation, active]);

    return null;
}

// Harita kontrolleri bileşeni
function MapControls({ following, setFollowing, isNavigating, stopNavigation }) {
    const map = useMap();

    // Harita olay dinleyicilerini ekle
    useMapEvents({
        // Kullanıcı manuel olarak haritayı hareket ettirirse, takibi devre dışı bırak
        dragstart: () => {
            if (following) setFollowing(false);
        }
    });

    return (
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-50">
            {/* Takip düğmesi */}
            <button
                onClick={() => setFollowing(!following)}
                className={`p-2 rounded-full ${
                    following ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
                title={following ? "Konumumu takip etmeyi durdur" : "Konumumu takip et"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Navigasyonu durdur düğmesi */}
            {isNavigating && (
                <button
                    onClick={stopNavigation}
                    className="p-2 rounded-full bg-red-500 text-white"
                    title="Navigasyonu durdur"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// Mesafe hesaplayıcı
function DistanceCalculator({ userLocation, destination, setRemainingDistance }) {
    useEffect(() => {
        if (!userLocation || !destination) return;

        // Haversine formülü kullanarak noktalar arasındaki mesafeyi hesaplama
        const userLatLng = L.latLng(userLocation[0], userLocation[1]);
        const destLatLng = L.latLng(destination[0], destination[1]);
        const distanceInMeters = userLatLng.distanceTo(destLatLng);

        setRemainingDistance(Math.round(distanceInMeters));
        console.log(`Mesafe güncellendi: ${Math.round(distanceInMeters)}m`);

        // Kullanıcının hedefe varıp varmadığını kontrol et (20 metre içinde)
        if (distanceInMeters < 20) {
            alert("Hedefinize ulaştınız!");
        }
    }, [userLocation, destination, setRemainingDistance]);

    return null;
}

// Modal içinde navigasyon haritasını gösteren bileşen
function NavigationMap({ facultyId, userLocation, isLoading, isNavigating, setRemainingDistance, setUserLocation, stopNavigation }) {
    const [following, setFollowing] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const faculty = facultyData.faculty.find(f => f.id === facultyId);

    useEffect(() => {
        if (mapReady && faculty) {
            console.log("Harita hazır ve öğretim üyesi seçildi");
        }
    }, [mapReady, faculty]);

    if (isLoading || !faculty) {
        return <div className="flex items-center justify-center h-64">Harita yükleniyor...</div>;
    }

    return (
        <div className="h-96 w-full rounded overflow-hidden relative">
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

                {/* Gerçek zamanlı güncellenen kullanıcı konum işaretçisi */}
                <UserLocationMarker
                    position={userLocation}
                    following={following}
                    setUserLocation={setUserLocation}
                />

                {/* Kırmızı ikonlu öğretim üyesi ofis işaretçisi */}
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
                            {faculty.office.building}, Oda {faculty.office.room}<br />
                            Kat {faculty.office.floor}
                        </div>
                    </Popup>
                </Marker>

                {/* Kullanıcı hareket ettikçe güncellenen gerçek zamanlı rota */}
                {isNavigating && (
                    <RealtimeRouting
                        userLocation={userLocation}
                        destination={faculty.office.coordinates}
                        active={isNavigating}
                    />
                )}

                {/* Harita kontrolleri (takip düğmesi, vb.) */}
                <MapControls
                    following={following}
                    setFollowing={setFollowing}
                    isNavigating={isNavigating}
                    stopNavigation={stopNavigation}
                />

                {/* Mesafe hesaplayıcı */}
                {isNavigating && (
                    <DistanceCalculator
                        userLocation={userLocation}
                        destination={faculty.office.coordinates}
                        setRemainingDistance={setRemainingDistance}
                    />
                )}
            </MapContainer>
        </div>
    );
}

// Navigasyon talimatları bileşeni
function NavigationInstructions({ facultyId, remainingDistance }) {
    const faculty = facultyData.faculty.find(f => f.id === facultyId);

    if (!faculty) return null;

    return (
        <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold text-lg mb-2">Ofis Bilgileri:</h3>
            <p><strong>Bina:</strong> {faculty.office.building}</p>
            <p><strong>Oda:</strong> {faculty.office.room}</p>
            <p><strong>Kat:</strong> {faculty.office.floor}</p>

            {remainingDistance !== null && (
                <div className="mt-2 p-3 bg-blue-100 rounded">
                    <p><strong>Kalan Mesafe:</strong> {remainingDistance > 1000
                        ? `${(remainingDistance / 1000).toFixed(2)} km`
                        : `${remainingDistance} metre`}
                    </p>
                </div>
            )}

            <p className="text-sm text-gray-600 mt-2">Ofise ulaşmak için haritadaki mavi rotayı takip edin.</p>
        </div>
    );
}

// Modal bileşeni
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="min-h-screen px-4 text-center">
                {/* Arka plan katmanı */}
                <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>

                {/* Bu element, tarayıcının modal içeriğini ortalamak için kullanılır. */}
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
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ana sayfanızda içe aktarılıp kullanılabilecek ana bileşen
export default function CampusNavigation() {
    const [selectedFacultyId, setSelectedFacultyId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState([34.0522, -118.2437]); // Varsayılan konum
    const [isLoading, setIsLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [remainingDistance, setRemainingDistance] = useState(null);
    const watchPositionRef = useRef(null);

    // Bileşen yüklendiğinde kullanıcının konumunu izlemeye başla
    useEffect(() => {
        if (navigator.geolocation) {
            // Önce tek bir konum al
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                    console.log("İlk konum ayarlandı:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("İlk konumu alırken hata:", error);
                    setLocationError("Konumunuza erişilemedi. Bunun yerine varsayılan konum kullanılıyor.");
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000
                }
            );

            // Sonra konumu izlemeye başla
            watchPositionRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                    console.log("Konum güncellendi:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Konum izlenirken hata:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        } else {
            setLocationError("Konum servisi tarayıcınız tarafından desteklenmiyor. Bunun yerine varsayılan konum kullanılıyor.");
        }

        // Bileşen kaldırıldığında watchPosition'ı temizle
        return () => {
            if (watchPositionRef.current) {
                navigator.geolocation.clearWatch(watchPositionRef.current);
            }
        };
    }, []);

    const handleNavigate = () => {
        if (!selectedFacultyId) return;

        setIsLoading(true);
        setIsModalOpen(true);
        setIsNavigating(true);

        // Harita verilerinin yüklenmesini simüle et
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
    const modalTitle = selectedFaculty ? `${selectedFaculty.name}'nin Ofisine Navigasyon` : '';

    return (
        <div className="container mx-auto p-4 max-w-md">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Kampüs Navigasyon Sistemi</h1>
                <p className="text-gray-600">Öğretim üyelerinin ofislerini bulun</p>
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
                            <span>Navigasyonu Durdur</span>
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}