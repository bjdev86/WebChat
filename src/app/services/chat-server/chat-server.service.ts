import { DataSerializerService } from '../data-serializer/data-serializer.service';
import * as DSC from '../data-serializer/DataStrConsts';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/* Class to deinfe the ChatServerService. This service will be responsible for 
 * connecting to and communicating with the ChatServer. This service will be a 
 * client of the 'DataSerializerService', used to serialize and unserialize  
 * data sent to and recieve from the chat server. */
export class ChatServerService 
{
    // Private Data Members 
    private soc:WebSocket;  
    private dataSerializerService:DataSerializerService;
    private sendBuff:Uint8Array;

    /**
     *  Class constructor to create a new ChatService. 
     * 
     * @param dataSerializer DataSerializerService singleton used to access the 
     *        datamembers of the DataSerializerService 
     */
    constructor(private dataSerializer: DataSerializerService) 
    { 
        // Intialize local data members 
        this.dataSerializer = dataSerializer;
        this.sendBuff = new Uint8Array(DSC.BUFF_SIZE);
    }


    /**
     * Function to attempt to connect to the chat server. The function returns 
     * a Promise that when successfully resolved will let the caller know the 
     * a Websocket connection was successfully established with the Chat Server
     * that will be handling chat multiplexing and account control for this app.
     * 
     * @param host The name of the host where the chat server is running 
     * @param port The port number where the chat server is running
     * 
     * @returns Promise<string>
     */
    public connect(host:String, port:String):Promise<string>
    {
      return new Promise(function (resolve: Function, reject: Function)
      {
        try 
        {
          /* Initiate a websocket connection using the given host and port 
           * number */
          this.soc = new WebSocket("ws://" + host + ":" + port);
         
          // Wait for the connection to be opened
          this.soc.onopen = (event:MessageEvent) =>
          {
            /* Once the connection is opened then the promise is resolved */
             resolve("Connection Established" + event.toString());
          }
        } 
        catch (error) 
        {
          /* If any errors occur while connecting then call the promises reject method, so the error may be handled. Pass the error message along to let the called know why the connection failed */
          reject(error.message);
        }
      }.bind(this));// Promise
    }// Function 

    /**
     * Function to disconnect this service's websocket from the chat server 
     * it's currently connected to. A Promise<string> is returned to indicate 
     * the success or failure of the requested disconnection. Any errors will 
     * be reported via the Promise's reject function. 
     * 
     * @returns Promise<string>
     * @todo allow caller to specify the close code reason why they are 
     *       disconnecting from the chat server, 1000 is the default  
     */
    public disconnect():Promise<string>
    {
      return new Promise((resolve, reject)=>
      {
        // Local Variable Declaration 
        let closeFrame = new Int8Array(8);

        try
        {
          // Tell the server the connection is about to be severed????
          
          // Close the socket on this client's end
          this.soc.close(1000, "All Done");

          /* Wait for the close event to be sent through the websocket protocol 
           * as translated by the JavaScript WebSocket API */
          this.soc.onclose = (event) => 
          {
               // Once the connection has been disconnected this promise has been resloved
               resolve(
                  "Connection Severed \n\tcode: " + event.code + 
                  " reason: " + event.reason + " was clean: " + 
                  event.wasClean); 
          }          
        }
        catch (error)
        {
           /* Catch any errors incured while shutting the connection down 
            * and reject the promise */
            reject (error.message);
        }
      });// Promise
    }// Function 

    /**
     * Function to send a command sting up to chat server and relay the server's
     * response through a promise. The funciton will allow the caller to handle 
     * the server's response or any errors that occured during the transmission 
     * issued by the WebSocket API.
     * 
     * @param cmdString The string containing the command and the command's 
     *        dependant data to be executed on the server. 
     * 
     * @returns Promise<String> Resolves to a dataString that will need to be 
     *          deserialized by the DataSerializer service. The string will be 
     *          raw and possible contain insgignifcant white-space characters.
     * 
     */
    private send(cmdString:String):Promise<String>
    {
      // Local Variable Declaration 
      const cmdEncoder:TextEncoder = new TextEncoder(); 
      const rspDecoder:TextDecoder = new TextDecoder(cmdEncoder.encoding);

      /* Encode the command string into UTF-8 format, putting it into the byte 
       * array for sending */
       this.sendBuff = cmdEncoder.encode(cmdString.toString());

        /* Return a promise that contains the server's response or any errors 
         * that occured during transimission */
        return new Promise(function(resolve: Function, reject: Function)
        {
          try
          {
              /* Create callback handler to decode the bytes array returned to 
               * a string, and then pass that string to the Promises resolve 
               * handler */
              this.soc.onmessage = (event:MessageEvent) =>
              {
                resolve (rspDecoder.decode(event.data));
              } 

              /* Send the encoded string, which has been placed in an 
               * unsigned byte buffer. */
              this.soc.send(this.sendBuff.buffer);
          }
          catch(error)          
          {
              /* If an error occures during the sending of the command to the 
               * chat server then this promise should terminate in rejection. 
               * Call the rejection handler passing the error message along. */
              reject (error.message); 
          }
        }.bind(this));// Promise 
    } // Function 

    /**
     * Function to allow a user to attempt to login to the ChatServer from this 
     * client application. Function forms a login command string and sends that 
     * to the server. A provided response handler function will determine the 
     * applications behavior in response to the server's response data string. 
     * A handler can be issued for handling any errors in data transmission. 
     * 
     * @param uname The username the client expects to login with
     * @param psswrd The password the client expects to login with
     * @param onRsp Handler to respone to ChatServer response
     * @param onErr Hanlder to handle errors during the data transmission 
     *        process between this client and the ChatServer
     * 
     */
    public login(uname:string, psswrd:string, onRsp:Function, onErr:Function): void 
    {
        // Local Variable Declaration 
        let cmdString:string = "";
        let RESPONSE:Map<string, string>

        // Build command string 'CMD=LOG_IN;UNAME=uname;PSSWRD=psswrd' 
        cmdString = DSC.CMD + DSC.KV_DELM + DSC.LOG_IN + DSC.ENTRY_DELM
                  + DSC.UNAME + DSC.KV_DELM + uname + DSC.ENTRY_DELM
                  + DSC.PSSWRD + DSC.KV_DELM + psswrd;

        // Send the string to the server 
        this.send(cmdString).then((serverRsp:String) =>
        {
            // Deserialize the string to associative map 
            RESPONSE = this.dataSerializer.deserialize(serverRsp);

            /* Pass the associative array unto the calling componet through the 
             * response handler */
            onRsp(RESPONSE);
        },
        // Handle Promise rejection
        (errorMsg:String) =>
        {
            // Pass the error message along to the error handler 
            onErr(errorMsg);
        });

        // IIFE asnyc/await approach 
        // (async function()
        // {
        //   try
        //   {
        //     let serverRsp = await this.send(cmdString);
            
        //     RESPONSE = this.dataSerializer.deserialize(serverRsp);

        //     onRsp(RESPONSE);
        //   }
        //   catch(error)
        //   {
        //     onErr(error);
        //   }
        // }.bind(this))();
    }
}
