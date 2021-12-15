/*
Name: Cell List
Data source: 1
Created By: admin
Last Update At: 2021-07-02T17:20:47.755Z
*/

SELECT  
	metadata_m.cell_id,  MAX(cycle_index), cathode, anode, ah, form_factor, test_temperature, soc_max, soc_min, soc_max-soc_min as DOD, crate_c, crate_d, source
FROM 
	(SELECT cell_metadata.cell_id, cathode, anode, source, ah, form_factor, test_temperature, soc_max, soc_min, v_max, v_min, crate_c, crate_d FROM cell_metadata inner join cycle_metadata on cell_metadata.cell_id = cycle_metadata.cell_id) as metadata_m
	left outer join cycle_stats on metadata_m.cell_id=cycle_stats.cell_id
where
   cathode IN ({{cathode}}) and
   ah IN ({{ah}}) and
   test_temperature IN ({{test_temperature}}) and
   crate_c IN ({{crate_c}}) and
   crate_d IN ({{crate_d}}) and
   soc_max IN ({{soc_max}}) and 
   soc_min IN ({{soc_min}}) and
   source IN ({{source}}) and  
   form_factor IN ({{form_factor}})   
GROUP BY            
   metadata_m.cell_id,
   soc_min,      
   soc_max,   
   crate_d,
   crate_c,  
   cathode, 
   anode,
   ah,
   test_temperature,
   form_factor,
   source
 order by metadata_m.source, metadata_m.cell_id  