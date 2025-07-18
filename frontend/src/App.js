import React from 'react';
import FlowUI from './FlowUI';
import "beercss";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      message: '',
      isAuthenticated: false,
      mode: 'login'  // or 'login'
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.switchMode = this.switchMode.bind(this);
  }

  handleNameChange(event) {
    this.setState({ name: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  switchMode() {
    const newMode = this.state.mode === 'register' ? 'login' : 'register';
    this.setState({ mode: newMode, message: '', name: '', password: '' });
  }

  handleSubmit(event) {
    event.preventDefault();

    const url = this.state.mode === 'register' ? '/api/register' : '/api/login';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        password: this.state.password
      })
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.error || 'Error');
          }
          return data;
        });
      })
      .then(function (data) {
        if(this.state.mode==='register'){
          this.setState({ mode: 'login', message: 'Successful registration', name: this.state.name, password: this.state.password })
          return;
        }
      this.setState({
        message: data.message,
        isAuthenticated: true,
        userId: data.userId,
        name: '',
        password: ''
      });
}.bind(this))

       
      .catch(function (error) {
        this.setState({ message: error.message });
      }.bind(this));
  }

  render() {
    if (this.state.isAuthenticated) {
    if (this.state.isAuthenticated) {
  return (
    <main className="responsive">
      <div className="padding absolute center middle">
        <article>
          <h5>TaleForge</h5>
        <p>Want to generate a story based on emotions? Of course you do! Add some emotions to the display below, connect each node to one other (like a piece of string), and click 'Run' to generate an AI story!</p>
        <FlowUI userId={this.state.userId} />
        </article>
      </div>
    </main>
  );
}

    }

    return (
      <main className="responsive">
        <div className="padding absolute center middle">
          <article className=" ">
        <h5>{this.state.mode === 'register' ? 'Register' : 'Login'}</h5>
        <form onSubmit={this.handleSubmit}>
          <div className="field label border">
          <input type="text" value={this.state.name} onChange={this.handleNameChange} required />            
          <label>Name: </label>
          </div>
           <div className="field label border">
            <input type="password" value={this.state.password} onChange={this.handlePasswordChange} required />
          <label>Password: </label>
          </div>
          
          <button type="submit">{this.state.mode === 'register' ? 'Register' : 'Login'}</button>
        </form>
        <p>{this.state.message}</p>
        <button onClick={this.switchMode}>
          Switch to {this.state.mode === 'register' ? 'Login' : 'Register'}
        </button>      
        </article>
        </div>
      </main>
    );
  }
}

export default App;
