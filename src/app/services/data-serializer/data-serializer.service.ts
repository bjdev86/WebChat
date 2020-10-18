import  * as DST from '../DataStrConsts'; 
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/* Class to define a class to deserialize incoming byte strings from the 
 * ChatServer. */
export class DataSerializerService 
{ 
     

  // Class Constructor used to create a new DataDeserializer 
  constructor() 
  { 

  }

  public static deserialize (data:any[]): Map <String, String>
  {
      // Local Variable Declaration 
      let asocArray: Map<String, String>  = new Map<String, String>();
      let keyVals: String[], entries:String[];
      
      // Convert the data byte array into a String 
      let dataString: String  = data.toString().trim();
      
      // Proceed only if the empty string wasn't passed
      if(dataString !== "")
      {        
          // Parse the data string over the expected semicolons
          entries = dataString.split(DST.ENTRY_DELM);
          

          // Loop through each entry 
          for (let entry of entries) 
          {
              // Parse the entry string over the equals since, spliting key from value
              keyVals = entry.split(DST.KV_DELM);

              // Put the key-value pair in the associative array 
              asocArray.set(keyVals[0], keyVals[1]);
          }
      }

      return asocArray;
  }
}
