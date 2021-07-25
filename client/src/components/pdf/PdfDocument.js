import React, { Component } from "react";
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import background from './assets/background.jpg';


class PDFDocument extends Component {

    styles = StyleSheet.create({
      pageBackground: {
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100%',
        display: 'block',
        height: '100%',
        width: '100%',
      },
      fullSize: {
        height: '100%',
        width: '100%',
      },
      title: {
        position: 'absolute',
        top: '75px',
        left: '350px',
      },
      firstname: {
        position: 'absolute',
        top: '100px',
        left: '100px',
      },
      lastname: {
        position: 'absolute',
        top: '125px',
        left: '100px',
      },
    });


    constructor(props) {
      super(props);
    }


    render() {
        return (
          <Document>
            <Page size="A4" orientation="landscape">
              <View style={this.styles.fullSize}>
                <Image src={background} style={this.styles.pageBackground} />
                <Text style={this.styles.title}>{this.props.data.title}</Text>
                <Text style={this.styles.firstname}>{this.props.data.firstname}</Text>
                <Text style={this.styles.lastname}>{this.props.data.lastname}</Text>
              </View>
            </Page>
          </Document>
        );
    }
}

export default PDFDocument;
