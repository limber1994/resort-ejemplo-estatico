import React, {Component} from 'react';
//import datos from './data';
import Client from './Contentful';
const RoomContext = React.createContext();
class RoomProvider extends Component{
    state={
        rooms:[],
        roomsOrdenados:[],
        roomsCaracteristicas:[],
        loading: true,
        tipo: 'all',
        capacidad: 1,
        precio:0,
        precioMin:0,
        precioMax:0,
        tamanioMin:0,
        tamanioMax:0,
        desayuno:true,
        mascotas:false
    };
    getData = async ()=>{
        try{
            let response = await Client.getEntries({
                content_type:'datosHabitacion',
                order: 'sys.createdAt'
            });
            let rooms = this.formatearDatos(response.items);
            let roomsCaracteristicas = rooms.filter(room=>room.featured===true);
            let precioMax = Math.max(...rooms.map(item=>item.price));
            let tamanioMax = Math.max(...rooms.map(item=>item.size));
            this.setState({
                rooms,
                roomsCaracteristicas,
                roomsOrdenados:rooms,
                loading:false,
                precio: precioMax,
                precioMax,
                tamanioMax
            });
        } catch (error){
            console.log(error)
        }
    }
    formatearDatos(items){
        let datosTmp = items.map(item=>{
            let id = item.sys.id;
            let images = item.fields.images.map(image=>image.fields.file.url);
            let room = {...item.fields,images,id}
            return room;
        });
        return datosTmp;
    }
    componentDidMount(){
        this.getData();
    }
    getRoom = (slug)=>{
        let tempRooms = [...this.state.rooms];
        let room = tempRooms.find((room)=>room.slug===slug);
        return room;
    }
    handleChange = event =>{
        const target = event.target;
        const value = target.type === 'checkbox'? target.checked:target.value;
        const name = event.target.name;
        this.setState({
            [name]:value
        }, this.filterRooms)
    }
    filterRooms = ()=>{
        let tempRooms = this.state.rooms;
        let capacidad = parseInt(this.state.capacidad);
        let precio = parseInt(this.state.precio);
        if(this.state.tipo !== 'all'){
            tempRooms = tempRooms.filter(room=>room.type===this.state.tipo);
        }
        if(capacidad !==1){
            tempRooms = tempRooms.filter(room=>room.capacidad >= capacidad)
        }
        tempRooms = tempRooms.filter(room=>room.price<=precio)
        tempRooms = tempRooms.filter(room=>room.size>=this.state.tamanioMin && room.size<=this.state.tamanioMax);
        if(this.state.desayuno){
            tempRooms = tempRooms.filter(room=>room.breakfast);
        }
        if(this.state.mascotas){
            tempRooms = tempRooms.filter(room=>room.pets);
        }
        this.setState({roomsOrdenados: tempRooms})
    }
    render(){
        return(
            <RoomContext.Provider value={{
                ...this.state,
                getRoom: this.getRoom,
                handleChange: this.handleChange
            }}>
                {this.props.children}
            </RoomContext.Provider>
        )
    }
}
const RoomConsumer = RoomContext.Consumer;
export function WithRoomConsumer(Component){
    return function ConsumerWrapper(props){
        return <RoomConsumer>
            {value=><Component {...props} context={value}></Component>}
        </RoomConsumer>
    }
}
export {RoomProvider, RoomConsumer, RoomContext}
