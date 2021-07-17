import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import Web3Context from '../Web3Context';


class Home extends Component {

   static contextType = Web3Context;

   state = { juryTrainings: null }


   async componentDidMount() {
      const juryTrainings = [];

      const cm = this.context.contractTraining.methods;
      const nbTrainings = await cm.getTrainingsCountForJury(this.context.account).call();
      for (let i = 0; i < nbTrainings; i++) {
         const trainingId = await cm.getTrainingForJury(this.context.account, i).call();
         const training = await cm.trainings(trainingId).call();

         juryTrainings.push({ id: trainingId, ...training });
      }

      this.setState({ juryTrainings });
   }


   render() {
      if (this.state.juryTrainings === null) {
         return <div>Loading...</div>;
      }

      return (
         <Container>
            { this.state.juryTrainings && this.state.juryTrainings.length > 0 &&
               <>
               <h3>Jury pour les formations</h3>
               <ul>
               { this.state.juryTrainings.map((training, index) => 
                  <li key={index}><a href={`/trainings/${training.id}/validation`}>{ training.name }</a></li>
               )}
               </ul>
               </>
            }
         </Container>
      );
   }
}

export default Home;
