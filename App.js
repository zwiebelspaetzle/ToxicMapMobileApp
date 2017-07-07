import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.defaultRegion = {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    this.state = {
      region: this.defaultRegion,
      sites: []
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let newRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        this.setState({
          region: newRegion,
          error: null,
        });

      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );

    this.getSites();
  }

  onRegionChange(region) {
    this.setState({ region: region });
  }

  getSites() {
    let sitesArray = [];

    function status(response) {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
      } else {
        return Promise.reject(new Error(response.statusText))
      }
    }

    function json(response) {
      return response.json();
    }

    fetch('http://138.68.55.32:8080/api/sites/near/41.2230,-111.9738?maxDist=100')
      .then(status)
      .then(json)
      .then((data) => {
        data.map((site) => {
          sitesArray.push({
            coordinate: {
              latitude: site.loc.coordinates[1],
              longitude: site.loc.coordinates[0]
            },
            title: site.name
          });
        });
      })
      .then(() => {
        this.setState({sites: sitesArray});
      })
      .catch(function(error) {
        console.log('Request failed', error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView style={styles.map}
          initialRegion={this.defaultRegion}
          region={this.state.region}
        >
          {this.state.sites.map((site, i) => {
            return (
            <MapView.Marker
              coordinate={site.coordinate}
              title={site.title}
              key={i}
            />
          )
          })}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    backgroundColor: '#ddd',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
