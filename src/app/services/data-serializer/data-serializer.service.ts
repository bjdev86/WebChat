import  * as DSC from './DataStrConsts'; 
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/* Class to define a class to deserialize incoming byte strings from the 
 * ChatServer. */
export class DataSerializerService 
{ 
  // Class Constructor used to create a new DataDeserializer 
  constructor() {}

  /**
   * Function to deserialize raw data string responses coming back from the 
   * ChatServer based upon an agreed upon protocol for searializing and 
   * deserializing command strings.
   *  
   * @param data The raw data string response sent back from the ChatServer to 
   *        be deserialed into an associative Mapping 
   */
  public deserialize (data:String): Map <string, string>
  {
      // Local Variable Declaration 
      let asocArray: Map<string, string>  = new Map<string, string>();
      let keyVals: string[], entries:string[];
      
      // Trim any whitespace off the data string sent back 
      let dataString: String  = data.trim();
      
      // Proceed only if the empty string wasn't passed
      if(dataString !== "")
      {        
          // Parse the data string over the expected semicolons
          entries = dataString.split(DSC.ENTRY_DELM);          

          // Loop through each entry 
          for (let entry of entries) 
          {
              // Parse the entry string over the equals since, spliting key from value
              keyVals = entry.split(DSC.KV_DELM);

              // Put the key-value pair in the associative array 
              asocArray.set(keyVals[0], keyVals[1]);
          }
      }

      return asocArray;
  }
}
