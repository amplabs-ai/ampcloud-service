EFFICIENCY_QUERY = """
SELECT
    key || ': ' || r.cell_id as series,
    r.cycle_index,
    value
FROM (SELECT cell_id, trunc(cycle_index,0) as cycle_index, json_build_object('e_eff', TRUNC(e_eff::numeric,3), 'ah_eff', TRUNC(ah_eff::numeric,3)) AS line 
FROM cycle_stats
where cell_id IN {cell_id} and ah_eff<1.004 and email = '{email}') as r
JOIN LATERAL json_each_text(r.line) ON (key ~ '[e,ah]_[eff]')
GROUP by r.cell_id, r.cycle_index, json_each_text.key, json_each_text.value
order by r.cell_id,r.cycle_index, key 
"""
ENERGY_AND_CAPACITY_DECAY_QUERY = """
SELECT
    key || ': ' || r.cell_id as series,
    r.cycle_index,
    r.test_time,
value
FROM (SELECT cell_id, trunc(cycle_index::numeric,0) as cycle_index, test_time, json_build_object('e_d', TRUNC(e_d::numeric,3), 'ah_d', TRUNC(ah_d::numeric,3) ) AS line 
FROM cycle_stats
where cell_id IN {cell_id} and ah_eff<1.1 and email = '{email}') as r
JOIN LATERAL json_each_text(r.line) ON (key ~ '[e,ah]_[d]')
GROUP by r.cell_id, r.cycle_index,  r.test_time, json_each_text.key, json_each_text.value      
order by r.cell_id,r.cycle_index, key
"""
CYCLE_QUANTITIES_BY_STEP_QUERY = """
select * from 
(SELECT
    cycle_time,
    v,  
    cycle_index,  
    case 
        when i>0 then
            ah_c  
        when i<0 then
            ah_d
        end ah,
    case 
        when i>0 then
            cell_id || ' c: ' || cycle_index  
        when i<0 then
            cell_id || ' d: ' || cycle_index
        end series
FROM cycle_timeseries
where 
    cell_id IN {cell_id} and 
    (MOD(cycle_index,{step})=0 or cycle_index = 1 or cycle_index = ( SELECT MAX(cycle_index) FROM cycle_stats WHERE cell_id IN {cell_id} and email = '{email}')) and 
    email = '{email}'
order by cycle_index, test_time, series) as foo where series is not null
"""
COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY = """
SELECT KEY || ': ' || r.cell_id AS series_1,
KEY || ' ' || cycle_index || ': ' || r.cell_id AS series_2,
              r.cycle_index,
              r.test_time,
              r.cycle_time,
              value
FROM
  (SELECT cycle_timeseries.cell_id,
          cycle_index,
          test_time,
          cycle_time,
          json_build_object('V', v, 'C', i) AS line
   FROM cycle_timeseries
   WHERE cell_id IN {cell_id} and email = '{email}'
     ) AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[V,C]')
ORDER BY r.cell_id,
         r.test_time,
         r.cycle_time,
         KEY 
"""
ABUSE_TEST_TEMPRATURES="""
SELECT KEY || ': ' || r.cell_id AS series_1,
KEY || ': ' || r.cell_id AS series_2,
              r.test_time,
              value
FROM
  (SELECT abuse_timeseries.cell_id,
          test_time,
          json_build_object(
            'Tbp',below_punch_temperature,   
            'Tap', above_punch_temperature,
            'Tlb', left_bottom_temperature, 
            'Trb', right_bottom_temperature,
            'Tpt', pos_terminal_temperature,
            'Tnp', neg_terminal_temperature
        ) AS line
   FROM abuse_timeseries TABLESAMPLE BERNOULLI ({sample})
   WHERE cell_id IN {cell_id} and email = '{email}') AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[Tbp,Tap,Tlb,Trb,Tpt,Tnp]')
where value <> '0' 
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
ABUSE_FORCE_AND_DISPLACEMENT="""
SELECT KEY || ': ' || r.cell_id AS series,
              r.test_time,
              value
FROM
  (SELECT abuse_timeseries.cell_id,
          test_time,
          json_build_object(
            'F', axial_f,
            'D', axial_d
        ) AS line
   FROM abuse_timeseries TABLESAMPLE BERNOULLI ({sample})
   WHERE cell_id IN {cell_id}  and email = '{email}') AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[F,D]')
where value <> '0' 
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
ABUSE_VOLTAGE="""
SELECT KEY || ': ' || r.cell_id AS series,
              r.test_time,
              value
FROM
  (SELECT abuse_timeseries.cell_id,
          test_time,
          json_build_object(
            'v',v
        ) AS line
   FROM abuse_timeseries TABLESAMPLE BERNOULLI ({sample})
   WHERE cell_id IN {cell_id} and email = '{email}') AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[v]')
where value <> '0' 
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
