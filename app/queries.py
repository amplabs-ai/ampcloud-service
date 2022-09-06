EFFICIENCY_QUERY = """
SELECT
    r.cell_id,
    key || ': ' || r.cell_id as series,
    r.cycle_index,
    value
FROM (SELECT cell_id, trunc(cycle_index,0) as cycle_index, json_build_object('e_eff', TRUNC(cycle_energy_efficiency::numeric,3), 'ah_eff', TRUNC(cycle_coulombic_efficiency::numeric,3)) AS line
FROM cycle_stats
where MOD(index, {mod_step}) =0 and cell_id IN {cell_id} and cycle_coulombic_efficiency<1.004 and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true'))) as r
JOIN LATERAL json_each_text(r.line) ON (key ~ '[e,ah]_[eff]')
GROUP by r.cell_id, r.cycle_index, json_each_text.key, json_each_text.value
order by r.cell_id,r.cycle_index, key
"""
ENERGY_AND_CAPACITY_DECAY_QUERY = """
SELECT
    r.cell_id,
    key || ': ' || r.cell_id as series,
    r.cycle_index,
    r.test_time,
value
FROM (SELECT cell_id, trunc(cycle_index::numeric,0) as cycle_index, test_time, json_build_object('e_d', TRUNC(cycle_discharge_energy::numeric,3), 'ah_d', TRUNC(cycle_discharge_capacity::numeric,3) ) AS line
FROM cycle_stats
where MOD(index, {mod_step}) =0 and cell_id IN {cell_id} and cycle_coulombic_efficiency<1.1 and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true'))) as r
JOIN LATERAL json_each_text(r.line) ON (key ~ '[e,ah]_[d]')
GROUP by r.cell_id, r.cycle_index,  r.test_time, json_each_text.key, json_each_text.value
order by r.cell_id,r.cycle_index, key
"""
CYCLE_QUANTITIES_BY_STEP_QUERY = """
select * from
(SELECT
    cell_id,
    cycle_time,
    voltage as v,
    cycle_index,
    case
        when current>0 then
            charge_capacity
        when current<0 then
            discharge_capacity
        end ah,
    case
        when current>0 then
            cell_id || ' c: ' || cycle_index
        when current<0 then
            cell_id || ' d: ' || cycle_index
        end series
FROM cycle_timeseries
where
    MOD(index, {mod_step}) = 0 and
    cell_id IN {cell_id} and
    (MOD(cycle_index,{step})=0 or cycle_index = 1 or cycle_index = ( SELECT MAX(cycle_index) FROM cycle_stats WHERE cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')))) and
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true'))
order by cell_id, cycle_index, test_time, series) as foo where series is not null
"""
GALVANOSTATIC_QUERY = """
select
  cell_id,
  series,
  v,
  case when foo.active_mass is null
  or foo.active_mass = 0 then ah else (ah / foo.active_mass) * 1000000 end specific_capacity
from
  (
    SELECT
      cycle_timeseries_new.cell_id,
      cycle_index,
      test_time,
      voltage as v,
      active_mass,
      case when current > 0 then charge_capacity when current < 0 then discharge_capacity end ah,
      case when current > 0 then cycle_timeseries_new.cell_id || ' c: ' || cycle_index when current < 0 then cycle_timeseries_new.cell_id || ' d: ' || cycle_index end series
    FROM
      (
        select
          email,
          cell_id,
          voltage,
          charge_capacity,
          discharge_capacity,
          current,
          cycle_index,
          test_time
        from
          cycle_timeseries
        where
          cell_id IN {cell_id}
          and (
            email in (
              '{email}',
              'info@batteryarchive.org',
              'data.matr.io@tri.global'
            )
            or email in (
              select
                distinct email
              from
                cell_metadata
              where
                is_public = 'true'
            )
          ) {filters}
      ) cycle_timeseries_new
      inner join cell_metadata on cycle_timeseries_new.cell_id = cell_metadata.cell_id
      and cycle_timeseries_new.email = cell_metadata.email
  ) as foo
where
  foo.series is not null
order by
  foo.cycle_index,
  foo.test_time,
  foo.series
"""
ENERGY_DENSITY_QUERY = """
select
  cell_id,
  cycle_index,
  series,
  v,
  case when foo.active_mass is null
  or foo.active_mass = 0 then ah else (ah / foo.active_mass) * 1000000 end specific_capacity
from
  (
    SELECT
      cycle_timeseries_new.cell_id,
      cycle_index,
      test_time,
      voltage as v,
      active_mass,
      case when current > 0 then charge_capacity when current < 0 then discharge_capacity end ah,
      case when current > 0 then cycle_timeseries_new.cell_id || ' c: ' || cycle_index when current < 0 then cycle_timeseries_new.cell_id || ' d: ' || cycle_index end series
    FROM
      (
        select
          email,
          cell_id,
          voltage,
          charge_capacity,
          discharge_capacity,
          current,
          cycle_index,
          test_time
        from
          cycle_timeseries
        where
          cell_id IN {cell_id}
          and (
            email in (
              '{email}',
              'info@batteryarchive.org',
              'data.matr.io@tri.global'
            )
            or email in (
              select
                distinct email
              from
                cell_metadata
              where
                is_public = 'true'
            )
          ) {filters}
      ) cycle_timeseries_new
      inner join cell_metadata on cycle_timeseries_new.cell_id = cell_metadata.cell_id
      and cycle_timeseries_new.email = cell_metadata.email
  ) as foo
where
  foo.series is not null
order by
  foo.cycle_index,
  foo.test_time,
  foo.series
"""
COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY = """
SELECT KEY || ': ' || r.cell_id AS series_1,
KEY || ' ' || cycle_index || ': ' || r.cell_id AS series_2,
              r.cycle_index,
              r.test_time,
              r.cycle_time,
              r.cell_id,
              value
FROM
  (SELECT cycle_timeseries.cell_id,
          cycle_index,
          test_time,
          cycle_time,
          json_build_object('V', voltage, 'C', current) AS line
   FROM cycle_timeseries
   WHERE cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')))
     ) AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[V,C]')
ORDER BY r.cell_id,
         r.test_time,
         r.cycle_time,
         KEY
"""
DIFFERENTIAL_CAPACITY_QUERY="""
SELECT
    cell_id,
    dq_dv,
    voltage,
    case
        when current>0 then
            cell_id || ' c: ' || cycle_index
        when current<0 then
            cell_id || ' d: ' || cycle_index
        end series
FROM cycle_timeseries
where cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')) {filters}
order by cell_id, test_datapoint_ordinal
"""
VOLTAGE_TIME_QUERY="""
SELECT
    cell_id,
    voltage,
    test_time
FROM cycle_timeseries
where cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')) {filters}
order by cell_id, test_datapoint_ordinal
"""
CURRENT_TIME_QUERY="""
SELECT
    cell_id,
    current,
    test_time
FROM cycle_timeseries
where cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')) {filters}
order by cell_id, test_datapoint_ordinal
"""
ABUSE_TEST_TEMPRATURES="""
SELECT KEY || ': ' || r.cell_id AS series_1,
KEY || ': ' || r.cell_id AS series_2,
              r.test_time,
              r.cell_id,
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
   WHERE cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')))) AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[Tbp,Tap,Tlb,Trb,Tpt,Tnp]')
where value <> '0'
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
ABUSE_FORCE_AND_DISPLACEMENT="""
SELECT KEY || ': ' || r.cell_id AS series,
              r.cell_id,
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
   WHERE cell_id IN {cell_id}  and email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global')) AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[F,D]')
where value <> '0'
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
ABUSE_VOLTAGE="""
SELECT KEY || ': ' || r.cell_id AS series,
              r.cell_id,
              r.test_time,
              value
FROM
  (SELECT abuse_timeseries.cell_id,
          test_time,
          json_build_object(
            'v',v
        ) AS line
   FROM abuse_timeseries TABLESAMPLE BERNOULLI ({sample})
   WHERE cell_id IN {cell_id} and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')))) AS r
JOIN LATERAL json_each_text(r.line) ON (KEY ~ '[v]')
where value <> '0'
ORDER BY r.cell_id,
         r.test_time,
         KEY
"""
CAPACITY_RETENTION="""
select
  r.cell_id,
  r.cycle_index,
  (r.cycle_discharge_capacity / NULLIF(r.initial_discharge_capacity,0))*100 as capacity_retention
from
  (
    select
      cell_id,
      cycle_index,
      cycle_discharge_capacity,
      FIRST_VALUE(cycle_discharge_capacity) OVER(
        PARTITION BY cell_id, email
        ORDER BY
          cycle_index 
        RANGE BETWEEN UNBOUNDED PRECEDING
          AND UNBOUNDED FOLLOWING
      ) initial_discharge_capacity
    from
      cycle_stats
    where
      cell_id IN {cell_id}
      and (
        email in (
          '{email}',
          'info@batteryarchive.org',
          'data.matr.io@tri.global'
        )
        or email in (
          select
            distinct email
          from
            cell_metadata
          where
            is_public = 'true'
        )
      ) {filters}
  ) as r
"""
COULOMBIC_EFFICIENCY_QUERY = """
SELECT
    r.cell_id,
    r.cycle_index,
    value
FROM (SELECT cell_id, trunc(cycle_index,0) as cycle_index, json_build_object('ah_eff', TRUNC(cycle_coulombic_efficiency::numeric,3)) AS line
FROM cycle_stats
where cell_id IN {cell_id} and cycle_coulombic_efficiency<1.004 and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true')) {filters}) as r
JOIN LATERAL json_each_text(r.line) ON (key ~ 'ah_eff')
GROUP by r.cell_id, r.cycle_index, json_each_text.key, json_each_text.value
order by r.cell_id,r.cycle_index, key
"""
TIMESERIES_DATA="""
SELECT {columns}, cell_id
FROM
    cycle_timeseries
WHERE cell_id IN ({cell_ids}) and MOD(index, 5)=0 and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true'))
    {filters} order by cell_id, test_datapoint_ordinal
"""
STATS_DATA="""
SELECT {columns}, cell_id
FROM
    cycle_stats
WHERE cell_id IN ({cell_ids}) and (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or email in (select distinct email from cell_metadata where is_public='true'))
    {filters} order by cell_id, cycle_index
"""
